import { MapPin, X } from 'lucide-react';
import { NapBox, Port } from '../types';
import { useState } from 'react';

export function PortsModal({
  napBox,
  onClose,
  filteredNapBoxes,
}: {
  napBox: NapBox;
  onClose: () => void;
  filteredNapBoxes: 'all' | 'available' | 'occupied' | 'faulty';
}) {
  const portColor = {
    available: 'bg-green-500',
    occupied: 'bg-blue-500',
    faulty: 'bg-red-500',
  };

const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied' | 'faulty'>('all');

const filteredPorts = napBox?.ports.filter(port => {
    if (filterStatus === 'all') return true;
    return port.status === filterStatus;
  }) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl">{napBox.name} - Port Details</h2>
                <p className="text-gray-600 mt-1">
                  <MapPin className="inline" size={16} /> {napBox.location}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                All ({napBox.totalPorts})
              </button>
              <button
                onClick={() => setFilterStatus('available')}
                className={`px-4 py-2 rounded-lg ${filterStatus === 'available' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Available ({napBox.availablePorts})
              </button>
              <button
                onClick={() => setFilterStatus('occupied')}
                className={`px-4 py-2 rounded-lg ${filterStatus === 'occupied' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Occupied ({napBox.occupiedPorts})
              </button>
              <button
                onClick={() => setFilterStatus('faulty')}
                className={`px-4 py-2 rounded-lg ${filterStatus === 'faulty' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Faulty ({napBox.faultyPorts})
              </button>
            </div>

            {/* Ports Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-6">
              {filteredPorts.map((port) => (
                <div
                  key={port.portNumber}
                  className={`${portColor[port.status]} text-white p-3 rounded-lg cursor-pointer transition-all transform hover:scale-105`}
                  title={port.clientName || port.status}
                >
                  <div className="text-center">
                    <div className="text-xs opacity-80">Port</div>
                    <div className="text-lg">{port.portNumber}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Connected Clients Table */}
            <div className="border-t pt-6">
              <h3 className="text-xl mb-4">Connected Clients</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600">Port</th>
                      <th className="px-4 py-3 text-left text-gray-600">Client Name</th>
                      <th className="px-4 py-3 text-left text-gray-600">Plan</th>
                      <th className="px-4 py-3 text-left text-gray-600">Connected Since</th>
                      <th className="px-4 py-3 text-left text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {napBox.ports
                      .filter(port => port.status === 'occupied')
                      .map((port) => (
                        <tr key={port.portNumber} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Port {port.portNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3">{port.clientName || 'Unknown'}</td>
                          <td className="px-4 py-3">{port.clientPlan || 'N/A'}</td>
                          <td className="px-4 py-3">{port.connectedSince ? port.connectedSince.split('T')[0] : 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                port.clientStatus === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : port.clientStatus === 'inactive'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {port.clientStatus ? port.clientStatus.charAt(0).toUpperCase() + port.clientStatus.slice(1) : 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">Port Status Legend:</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Faulty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    
  );
}
