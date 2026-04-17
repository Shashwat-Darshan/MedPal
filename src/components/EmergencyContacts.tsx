import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Plus, AlertTriangle, Hospital, User, Shield } from 'lucide-react';

const EmergencyContacts = () => {
  const contacts = [
    {
      id: '1',
      name: 'Emergency Services (Police)',
      number: '100',
      type: 'emergency',
      icon: AlertTriangle,
      description: 'For immediate police assistance'
    },
    {
      id: '2',
      name: 'Fire Emergency',
      number: '101',
      type: 'emergency',
      icon: AlertTriangle,
      description: 'Fire brigade and rescue services'
    },
    {
      id: '3',
      name: 'Medical Emergency (Ambulance)',
      number: '102',
      type: 'emergency',
      icon: Hospital,
      description: 'Emergency medical services and ambulance'
    },
    {
      id: '4',
      name: 'Women Helpline',
      number: '1091',
      type: 'emergency',
      icon: Shield,
      description: 'Women in distress helpline'
    },
    {
      id: '5',
      name: 'Child Helpline',
      number: '1098',
      type: 'emergency',
      icon: Shield,
      description: 'Child emergency helpline'
    },
    {
      id: '6',
      name: 'Dr. Rajesh Kumar',
      number: '+91 98765 43210',
      type: 'doctor',
      icon: Hospital,
      description: 'General Physician - Apollo Hospital'
    },
    {
      id: '7',
      name: 'Emergency Contact Person',
      number: '+91 87654 32109',
      type: 'family',
      icon: User,
      description: 'Primary emergency contact'
    }
  ];

  const getContactStyle = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-50 border-red-200 hover:bg-red-100 hover-darken';
      case 'doctor': return 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover-darken';
      default: return 'bg-green-50 border-green-200 hover:bg-green-100 hover-darken';
    }
  };

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Phone className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="text-sm sm:text-base break-words">Emergency Contacts (India)</span>
          </div>
          <Button size="sm" variant="outline" className="flex-shrink-0 text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="whitespace-nowrap">Add Contact</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {contacts.map((contact) => {
          const Icon = contact.icon;
          return (
            <div key={contact.id} className={`p-3 border rounded-lg transition-all duration-300 ${getContactStyle(contact.type)} w-full overflow-hidden`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Icon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base break-words leading-tight">{contact.name}</h4>
                    <p className="text-sm text-gray-600 break-all">{contact.number}</p>
                    {contact.description && (
                      <p className="text-xs text-gray-500 mt-1 break-words leading-relaxed">{contact.description}</p>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleCall(contact.number)}
                  className={`flex-shrink-0 ${contact.type === 'emergency' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} px-2 py-1`}
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          );
        })}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-amber-800 break-words leading-relaxed">
                <strong>Note:</strong> These are standard emergency numbers for India. For location-specific services, contact your local authorities.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyContacts;
