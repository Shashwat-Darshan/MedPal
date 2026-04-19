const ACCOUNTS_STORAGE_KEY = 'medpal_accounts_v1';
const SESSION_STORAGE_KEY = 'medpal_session_v1';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const DEMO_ACCOUNT = {
  name: 'Test User',
  email: 'test@gmail.com',
  password: 'test',
};

export interface AuthAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  issuedAt: string;
  expiresAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isAuthenticated: true;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

let initPromise: Promise<void> | null = null;

type RawAccount = Partial<AuthAccount> & {
  password?: string;
};

const getCryptoApi = () => {
  const candidate = globalThis.crypto;
  return candidate && typeof candidate === 'object' ? candidate : null;
};

const randomHex = (byteLength: number) => {
  const cryptoApi = getCryptoApi();

  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(byteLength);
    cryptoApi.getRandomValues(bytes);
    return toHex(bytes);
  }

  let output = '';
  for (let index = 0; index < byteLength; index += 1) {
    output += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0');
  }

  return output;
};

const ensureInitialized = async () => {
  if (!initPromise) {
    initPromise = initializeAuthStore();
  }

  await initPromise;
};

const initializeAuthStore = async () => {
  const accounts = await normalizeStoredAccounts(readAccounts());

  if (accounts.length > 0) {
    writeAccounts(accounts);
  }

  const normalizedDemoEmail = normalizeEmail(DEMO_ACCOUNT.email);
  const demoExists = accounts.some((account) => account.email === normalizedDemoEmail);

  if (!demoExists) {
    const salt = generateSalt();
    const passwordHash = await hashPassword(DEMO_ACCOUNT.password, salt);
    const demoAccount: AuthAccount = {
      id: generateId(),
      name: DEMO_ACCOUNT.name,
      email: normalizedDemoEmail,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };

    writeAccounts([...accounts, demoAccount]);
  }
};

const readAccounts = (): AuthAccount[] => {
  const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as AuthAccount[]) : [];
  } catch {
    return [];
  }
};

const writeAccounts = (accounts: AuthAccount[]) => {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
};

const readSession = (): AuthSession | null => {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as AuthSession;

    if (!parsed?.token || !parsed?.userId || !parsed?.expiresAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writeSession = (session: AuthSession) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const clearSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizeStoredName = (name: unknown) => {
  if (typeof name !== 'string') {
    return 'MedPal User';
  }

  const trimmed = name.trim();
  return trimmed || 'MedPal User';
};

const normalizeStoredAccounts = async (accounts: AuthAccount[]): Promise<AuthAccount[]> => {
  const rawAccounts = accounts as unknown as RawAccount[];
  const migrated: AuthAccount[] = [];

  for (const rawAccount of rawAccounts) {
    if (!rawAccount || typeof rawAccount.email !== 'string') {
      continue;
    }

    const normalizedEmail = normalizeEmail(rawAccount.email);

    if (!normalizedEmail) {
      continue;
    }

    const id = typeof rawAccount.id === 'string' && rawAccount.id.trim() ? rawAccount.id : generateId();
    const name = normalizeStoredName(rawAccount.name);
    const createdAt =
      typeof rawAccount.createdAt === 'string' && rawAccount.createdAt.trim()
        ? rawAccount.createdAt
        : new Date().toISOString();

    let salt = typeof rawAccount.salt === 'string' ? rawAccount.salt : '';
    let passwordHash = typeof rawAccount.passwordHash === 'string' ? rawAccount.passwordHash : '';

    if ((!salt || !passwordHash) && typeof rawAccount.password === 'string') {
      salt = generateSalt();
      passwordHash = await hashPassword(rawAccount.password, salt);
    }

    if (!salt || !passwordHash) {
      continue;
    }

    if (migrated.some((account) => account.email === normalizedEmail)) {
      continue;
    }

    migrated.push({
      id,
      name,
      email: normalizedEmail,
      passwordHash,
      salt,
      createdAt,
    });
  }

  return migrated;
};

const generateId = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `auth_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const generateSalt = () => {
  return randomHex(16);
};

const generateToken = () => {
  const cryptoApi = getCryptoApi();

  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID().replace(/-/g, '');
  }

  return randomHex(32);
};

const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const hashPassword = async (password: string, salt: string) => {
  const cryptoApi = getCryptoApi();
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);

  if (cryptoApi?.subtle?.digest) {
    const digest = await cryptoApi.subtle.digest('SHA-256', data);
    return toHex(new Uint8Array(digest));
  }

  let hash = 2166136261;
  for (let index = 0; index < data.length; index += 1) {
    hash ^= data[index];
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
};

const createSession = (userId: string): AuthSession => {
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  return {
    token: generateToken(),
    userId,
    issuedAt,
    expiresAt,
  };
};

const toAuthUser = (account: AuthAccount): AuthUser => ({
  id: account.id,
  name: account.name,
  email: account.email,
  isAuthenticated: true,
});

const validateSession = (session: AuthSession, accounts: AuthAccount[]) => {
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    clearSession();
    return null;
  }

  const account = accounts.find((entry) => entry.id === session.userId);

  if (!account) {
    clearSession();
    return null;
  }

  return {
    user: toAuthUser(account),
    token: session.token,
  } satisfies AuthResult;
};

export const rehydrateSession = async (): Promise<AuthResult | null> => {
  await ensureInitialized();

  const accounts = readAccounts();
  const session = readSession();

  if (!session) {
    return null;
  }

  return validateSession(session, accounts);
};

export const register = async ({ name, email, password }: RegisterInput): Promise<AuthResult> => {
  await ensureInitialized();

  const normalizedEmail = normalizeEmail(email);
  const accounts = readAccounts();

  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const account: AuthAccount = {
    id: generateId(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  const nextAccounts = [...accounts, account];
  writeAccounts(nextAccounts);

  const session = createSession(account.id);
  writeSession(session);

  return {
    user: toAuthUser(account),
    token: session.token,
  };
};

export const login = async ({ email, password }: LoginInput): Promise<AuthResult> => {
  await ensureInitialized();

  const normalizedEmail = normalizeEmail(email);
  const accounts = readAccounts();
  const account = accounts.find((entry) => entry.email === normalizedEmail);

  if (!account) {
    throw new Error('No account found for this email address.');
  }

  const passwordHash = await hashPassword(password, account.salt);

  if (passwordHash !== account.passwordHash) {
    throw new Error('Incorrect password. Please try again.');
  }

  const session = createSession(account.id);
  writeSession(session);

  return {
    user: toAuthUser(account),
    token: session.token,
  };
};

export const logout = () => {
  clearSession();
};

export const getCurrentSession = (): AuthSession | null => {
  const session = readSession();

  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    clearSession();
    return null;
  }

  return session;
};