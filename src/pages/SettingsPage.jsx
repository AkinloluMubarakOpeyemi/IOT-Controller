import { useEffect, useState } from 'react';
import { FaSave, FaWifi } from 'react-icons/fa';
import PageHeader from '../components/common/PageHeader';
import { useFirebaseData } from '../hooks/useFirebaseData';

function SettingsPage() {
  const { settings, saveSettings } = useFirebaseData();
  const [form, setForm] = useState(settings);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveSettings({
      voltageLimit: Number(form.voltageLimit),
      currentLimit: Number(form.currentLimit),
      powerLimit: Number(form.powerLimit),
      costPerKWh: Number(form.costPerKWh),
      wifiSsid: form.wifiSsid || '',
      wifiPassword: form.wifiPassword || '',
    });
    setMessage('Settings saved to Firebase.');
  };

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="System Settings"
        description="Update safety thresholds, billing rate, and Wi-Fi credentials for the ESP32 controller."
      />

      <form className="panel max-w-3xl p-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Voltage Limit (V)</span>
            <input className="input" type="number" value={form.voltageLimit || ''} onChange={handleChange('voltageLimit')} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Current Limit (A)</span>
            <input className="input" type="number" value={form.currentLimit || ''} onChange={handleChange('currentLimit')} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Power Limit (W)</span>
            <input className="input" type="number" value={form.powerLimit || ''} onChange={handleChange('powerLimit')} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Cost Per kWh (NGN)</span>
            <input className="input" type="number" value={form.costPerKWh || ''} onChange={handleChange('costPerKWh')} />
          </label>
          <label>
            <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
              <FaWifi /> Wi-Fi SSID
            </span>
            <input className="input" value={form.wifiSsid || ''} onChange={handleChange('wifiSsid')} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Wi-Fi Password</span>
            <input
              className="input"
              type="password"
              value={form.wifiPassword || ''}
              onChange={handleChange('wifiPassword')}
            />
          </label>
        </div>
        {message ? <p className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">{message}</p> : null}
        <div className="mt-5">
          <button className="btn-primary">
            <FaSave /> Save settings
          </button>
        </div>
      </form>
    </>
  );
}

export default SettingsPage;
