'use client';

import { useState } from 'react';

interface Contact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newContact, setNewContact] = useState<Contact>({
    name: '',
    relationship: '',
    phone: '',
    email: ''
  });

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      setContacts([...contacts, newContact]);
      setNewContact({ name: '', relationship: '', phone: '', email: '' });
      setShowForm(false);
    }
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">🚨 Emergency Contacts</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm px-4 py-2"
        >
          {showForm ? '✕ Cancel' : '+ Add Contact'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 glass-card animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="glass-input"
            />
            <input
              type="text"
              placeholder="Relationship (e.g., Spouse, Parent)"
              value={newContact.relationship}
              onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              className="glass-input"
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="glass-input"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              className="glass-input"
            />
          </div>
          <button
            onClick={addContact}
            className="btn-primary mt-4 w-full"
          >
            Save Contact
          </button>
        </div>
      )}

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No emergency contacts added yet</p>
            <p className="text-sm mt-2">Add contacts who should be notified in case of emergency</p>
          </div>
        ) : (
          contacts.map((contact, index) => (
            <div key={index} className="glass-card p-4 hover:scale-[1.01] transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{contact.name}</h4>
                  {contact.relationship && (
                    <p className="text-sm text-gray-400">{contact.relationship}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-300">📞 {contact.phone}</p>
                    {contact.email && (
                      <p className="text-sm text-gray-300">📧 {contact.email}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeContact(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
