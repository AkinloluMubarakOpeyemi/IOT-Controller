import { useEffect, useState } from 'react';
import { FaSave, FaWifi } from 'react-icons/fa';
import PageHeader from '../components/common/PageHeader';
import { useFirebaseData } from '../hooks/useFirebaseData';

function SettingsPage() {
  const { settings, saveSettings } = useFirebaseData();
  const [form, setForm] = useState(settings);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setMessageType('success');

    try {
      await saveSettings({
        voltageLimit: Number(form.voltageLimit),
        currentLimit: Number(form.currentLimit),
        powerLimit: Number(form.powerLimit),
        costPerKWh: Number(form.costPerKWh),
        wifiSsid: form.wifiSsid || '',
        wifiPassword: form.wifiPassword || '',
      });
      setMessageType('success');
      setMessage('Settings saved to Firebase.');
    } catch (error) {
      setMessageType('error');
      setMessage(error?.message || 'Unable to save settings to Firebase.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="System Settings"
        description="Update Firebase safety limits, billing rate, and ESP32 Wi-Fi credentials."
      />

      <form className="panel max-w-3xl p-5" onSubmit={handleSubmit}>
        <div className="mb-5 rounded-lg bg-cyan-500/10 p-4 text-sm text-cyan-800 dark:text-cyan-200">
          <p className="font-semibold">Firebase write targets</p>
          <p className="mt-1 text-xs">
            Limits save to <code>settings</code>. Wi-Fi credentials save to <code>config</code> for the controller.
          </p>
        </div>

        <div className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Protection limits</div>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Voltage Limit (V)</span>
            <input className="input" type="number" min="0" value={form.voltageLimit || ''} onChange={handleChange('voltageLimit')} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Current Limit (A)</span>
            <input className="input" type="number" min="0" step="0.01" value={form.currentLimit || ''} onChange={handleChange('currentLimit')} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Power Limit (W)</span>
            <input className="input" type="number" min="0" value={form.powerLimit || ''} onChange={handleChange('powerLimit')} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Cost Per kWh (NGN)</span>
            <input className="input" type="number" min="0" step="0.01" value={form.costPerKWh || ''} onChange={handleChange('costPerKWh')} />
          </label>
        </div>

        <div className="mb-3 mt-6 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Controller Wi-Fi</div>
        <div className="grid gap-4 md:grid-cols-2">
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
        {message ? (
          <p
            className={`mt-4 rounded-lg p-3 text-sm ${
              messageType === 'error' ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
            }`}
          >
            {message}
          </p>
        ) : null}
        <div className="mt-5">
          <button className="btn-primary" disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>
    </>
  );
}

export default SettingsPage;
