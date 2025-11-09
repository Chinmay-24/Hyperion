'use client';

import { useState } from 'react';

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  notes: string;
}

export default function PrescriptionTracker() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPrescription, setNewPrescription] = useState<Prescription>({
    medication: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    notes: ''
  });

  const addPrescription = () => {
    if (newPrescription.medication && newPrescription.dosage) {
      setPrescriptions([...prescriptions, newPrescription]);
      setNewPrescription({
        medication: '',
        dosage: '',
        frequency: '',
        startDate: '',
        endDate: '',
        prescribedBy: '',
        notes: ''
      });
      setShowForm(false);
    }
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const isActive = (prescription: Prescription) => {
    if (!prescription.endDate) return true;
    return new Date(prescription.endDate) >= new Date();
  };

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">💊 Prescription Tracker</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm px-4 py-2"
        >
          {showForm ? '✕ Cancel' : '+ Add Prescription'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 glass-card animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Medication Name *"
              value={newPrescription.medication}
              onChange={(e) => setNewPrescription({ ...newPrescription, medication: e.target.value })}
              className="glass-input"
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 500mg) *"
              value={newPrescription.dosage}
              onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
              className="glass-input"
            />
            <input
              type="text"
              placeholder="Frequency (e.g., Twice daily)"
              value={newPrescription.frequency}
              onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
              className="glass-input"
            />
            <input
              type="text"
              placeholder="Prescribed by"
              value={newPrescription.prescribedBy}
              onChange={(e) => setNewPrescription({ ...newPrescription, prescribedBy: e.target.value })}
              className="glass-input"
            />
            <input
              type="date"
              placeholder="Start Date"
              value={newPrescription.startDate}
              onChange={(e) => setNewPrescription({ ...newPrescription, startDate: e.target.value })}
              className="glass-input"
            />
            <input
              type="date"
              placeholder="End Date"
              value={newPrescription.endDate}
              onChange={(e) => setNewPrescription({ ...newPrescription, endDate: e.target.value })}
              className="glass-input"
            />
            <textarea
              placeholder="Additional notes"
              value={newPrescription.notes}
              onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
              className="glass-input md:col-span-2"
              rows={2}
            />
          </div>
          <button
            onClick={addPrescription}
            className="btn-primary mt-4 w-full"
          >
            Save Prescription
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prescriptions.length === 0 ? (
          <div className="md:col-span-2 text-center py-8 text-gray-400">
            <p>No prescriptions tracked yet</p>
            <p className="text-sm mt-2">Keep track of your medications and dosages</p>
          </div>
        ) : (
          prescriptions.map((prescription, index) => (
            <div 
              key={index} 
              className={`glass-card p-4 hover:scale-[1.02] transition-all ${
                isActive(prescription) ? 'ring-2 ring-green-500/50' : 'opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">{prescription.medication}</h4>
                  <p className="text-sm text-blue-400">{prescription.dosage}</p>
                </div>
                <div className="flex gap-2">
                  {isActive(prescription) && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Active
                    </span>
                  )}
                  <button
                    onClick={() => removePrescription(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-sm text-gray-300">
                {prescription.frequency && <p>📅 {prescription.frequency}</p>}
                {prescription.prescribedBy && <p>👨‍⚕️ Dr. {prescription.prescribedBy}</p>}
                {prescription.startDate && (
                  <p>🗓️ {prescription.startDate} {prescription.endDate && `- ${prescription.endDate}`}</p>
                )}
                {prescription.notes && (
                  <p className="text-gray-400 italic mt-2">{prescription.notes}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
