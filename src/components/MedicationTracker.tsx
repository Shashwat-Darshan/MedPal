
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string;
  taken: boolean;
  color: string;
}

const MedicationTracker = () => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Daily',
      nextDose: '08:00 AM',
      taken: true,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: '2',
      name: 'Omega-3',
      dosage: '500mg',
      frequency: 'Twice daily',
      nextDose: '02:00 PM',
      taken: false,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: '3',
      name: 'Multivitamin',
      dosage: '1 tablet',
      frequency: 'Daily',
      nextDose: '08:00 AM',
      taken: true,
      color: 'bg-green-100 text-green-800'
    }
  ]);

  const markAsTaken = (id: string) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id ? { ...med, taken: true } : med
      )
    );
  };

  const pendingMedications = medications.filter(med => !med.taken);
  const takenMedications = medications.filter(med => med.taken);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-blue-600" />
            <span>Medication Tracker</span>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Med
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingMedications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span>Pending ({pendingMedications.length})</span>
            </h4>
            {pendingMedications.map((med) => (
              <div key={med.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">{med.name}</h5>
                    <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                  </div>
                  <Badge className={med.color}>
                    {med.nextDose}
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => markAsTaken(med.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Taken
                </Button>
              </div>
            ))}
          </div>
        )}

        {takenMedications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Completed Today ({takenMedications.length})</span>
            </h4>
            {takenMedications.map((med) => (
              <div key={med.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{med.name}</h5>
                    <p className="text-sm text-gray-600">{med.dosage}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Taken
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {medications.every(med => med.taken) && (
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">🎉</div>
            <p className="text-sm text-green-700 font-medium">All medications taken today!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationTracker;
