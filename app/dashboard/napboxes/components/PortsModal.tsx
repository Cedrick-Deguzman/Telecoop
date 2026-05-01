import { MapPin, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NapBox, Port } from '../types';

type PortFilterStatus =
  | 'all'
  | 'available'
  | 'occupied'
  | 'faulty'
  | 'internal_use'
  | 'test_line';

const portColor: Record<Exclude<PortFilterStatus, 'all'>, string> = {
  available: 'bg-green-500',
  occupied: 'bg-blue-500',
  faulty: 'bg-red-500',
  internal_use: 'bg-amber-500',
  test_line: 'bg-purple-500',
};

const statusLabel: Record<Exclude<PortFilterStatus, 'all'>, string> = {
  available: 'Available',
  occupied: 'Occupied',
  faulty: 'Faulty',
  internal_use: 'Internal Use',
  test_line: 'Test Line',
};

const manualStatusOptions: Array<Exclude<PortFilterStatus, 'all' | 'occupied'>> = [
  'available',
  'faulty',
  'internal_use',
  'test_line',
];

const legendStatuses: Array<Exclude<PortFilterStatus, 'all'>> = [
  'available',
  'occupied',
  'faulty',
  'internal_use',
  'test_line',
];

function countPorts(ports: Port[]) {
  return {
    available: ports.filter((port) => port.status === 'available').length,
    occupied: ports.filter((port) => port.status === 'occupied').length,
    faulty: ports.filter((port) => port.status === 'faulty').length,
    internal_use: ports.filter((port) => port.status === 'internal_use').length,
    test_line: ports.filter((port) => port.status === 'test_line').length,
  };
}

export function PortsModal({
  napBox,
  onClose,
  onUpdated,
}: {
  napBox: NapBox;
  onClose: () => void;
  onUpdated: (napBox: NapBox) => void;
}) {
  const [filterStatus, setFilterStatus] = useState<PortFilterStatus>('all');
  const [selectedPortNumber, setSelectedPortNumber] = useState<number | null>(null);
  const [draftStatus, setDraftStatus] = useState<Exclude<PortFilterStatus, 'all' | 'occupied'>>('available');
  const [isSaving, setIsSaving] = useState(false);

  const selectedPort = useMemo(
    () => napBox.ports.find((port) => port.portNumber === selectedPortNumber) ?? null,
    [napBox.ports, selectedPortNumber]
  );

  useEffect(() => {
    if (!selectedPort || selectedPort.status === 'occupied') {
      return;
    }

    setDraftStatus(selectedPort.status);
  }, [selectedPort]);

  const portCounts = useMemo(() => countPorts(napBox.ports), [napBox.ports]);

  const filteredPorts =
    napBox.ports.filter((port) => {
      if (filterStatus === 'all') {
        return true;
      }

      return port.status === filterStatus;
    }) || [];

  const handleSave = async () => {
    if (!selectedPort) {
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`/api/napboxes/ports/${selectedPort.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: draftStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to update port');
        setIsSaving(false);
        return;
      }

      onUpdated(data);
    } catch (error) {
      console.error(error);
      alert('Failed to update port');
    } finally {
      setIsSaving(false);
    }
  };

  const connectedPorts = napBox.ports.filter((port) => port.status === 'occupied');
  const specialPorts = napBox.ports.filter(
    (port) =>
      port.status === 'faulty' ||
      port.status === 'internal_use' ||
      port.status === 'test_line'
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl">{napBox.name} - Port Details</h2>
              <p className="text-gray-600 mt-1">
                <MapPin className="inline" size={16} /> {napBox.location}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
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
              Available ({portCounts.available})
            </button>
            <button
              onClick={() => setFilterStatus('occupied')}
              className={`px-4 py-2 rounded-lg ${filterStatus === 'occupied' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Occupied ({portCounts.occupied})
            </button>
            <button
              onClick={() => setFilterStatus('faulty')}
              className={`px-4 py-2 rounded-lg ${filterStatus === 'faulty' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Faulty ({portCounts.faulty})
            </button>
            <button
              onClick={() => setFilterStatus('internal_use')}
              className={`px-4 py-2 rounded-lg ${filterStatus === 'internal_use' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Internal Use ({portCounts.internal_use})
            </button>
            <button
              onClick={() => setFilterStatus('test_line')}
              className={`px-4 py-2 rounded-lg ${filterStatus === 'test_line' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Test Line ({portCounts.test_line})
            </button>
          </div>

          <div className="grid lg:grid-cols-[2fr,1fr] gap-6 mb-6">
            <div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {filteredPorts.map((port) => (
                  <button
                    key={port.id}
                    type="button"
                    onClick={() => setSelectedPortNumber(port.portNumber)}
                    className={`${portColor[port.status]} text-white p-3 rounded-lg transition-all transform hover:scale-105 ${
                      selectedPortNumber === port.portNumber ? 'ring-4 ring-offset-2 ring-indigo-300' : ''
                    }`}
                    title={port.clientName || statusLabel[port.status]}
                  >
                    <div className="text-center">
                      <div className="text-xs opacity-80">Port</div>
                      <div className="text-lg">{port.portNumber}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-lg mb-3">Port Settings</h3>
              {!selectedPort ? (
                <p className="text-sm text-gray-500">
                  Select a port to mark it as available, faulty, internal use, or test line.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Selected Port</p>
                    <p className="text-lg">Port {selectedPort.portNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <p className="text-sm font-medium">{statusLabel[selectedPort.status]}</p>
                  </div>
                  {selectedPort.clientId ? (
                    <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                      This port is linked to a client. Manage it from the client record instead of changing it here.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">New Status</label>
                        <select
                          value={draftStatus}
                          onChange={(e) =>
                            setDraftStatus(
                              e.target.value as Exclude<PortFilterStatus, 'all' | 'occupied'>
                            )
                          }
                          disabled={isSaving}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                        >
                          {manualStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || selectedPort.status === draftStatus}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                      >
                        {isSaving ? 'Saving Port...' : 'Save Port Status'}
                      </button>
                      <p className="text-xs text-gray-500">
                        Use <span className="font-medium">Internal Use</span> for your own live line and <span className="font-medium">Test Line</span> for a dedicated testing port.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

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
                  {connectedPorts.map((port) => (
                    <tr key={port.id} className="hover:bg-gray-50">
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
                          {port.clientStatus
                            ? port.clientStatus.charAt(0).toUpperCase() + port.clientStatus.slice(1)
                            : 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {connectedPorts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                        No client-linked ports on this NAP box yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl mb-4">Special Ports</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600">Port</th>
                    <th className="px-4 py-3 text-left text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {specialPorts.map((port) => (
                    <tr key={port.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">Port {port.portNumber}</td>
                      <td className="px-4 py-3">{statusLabel[port.status]}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {port.status === 'internal_use'
                          ? 'Reserved for your own connection'
                          : port.status === 'test_line'
                          ? 'Reserved for testing'
                          : 'Unavailable for assignment'}
                      </td>
                    </tr>
                  ))}
                  {specialPorts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                        No internal, test, or faulty ports on this NAP box.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-3">Port Status Legend:</p>
            <div className="flex flex-wrap gap-4">
              {legendStatuses.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${portColor[status]}`}></div>
                  <span className="text-sm">{statusLabel[status]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
