import React, { useState } from 'react';
import { Mail, Plus, X, Send, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';

export default function InvitePanel() {
    const [emails, setEmails] = useState(['']);
    const [subject, setSubject] = useState('You are invited to join Alumni Connect!');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const addEmail    = () => setEmails(e => [...e, '']);
    const removeEmail = (idx) => setEmails(e => e.filter((_, i) => i !== idx));
    const updateEmail = (idx, val) => setEmails(e => e.map((em, i) => i === idx ? val : em));

    const validEmails = emails.filter(em => em.trim() && em.includes('@'));

    const handleSend = async (e) => {
        e.preventDefault();
        if (validEmails.length === 0) {
            setError('Please add at least one valid email address.');
            return;
        }
        setSending(true);
        setError('');
        try {
            const res = await api.post('/api/admin/invite', {
                emails: validEmails,
                subject,
                message,
            });
            setSuccess(res.message || `Invitations sent to ${validEmails.length} recipient(s)!`);
            setEmails(['']);
            setMessage('');
            setTimeout(() => setSuccess(''), 6000);
        } catch (err) {
            setError(err.message || 'Failed to send invitations. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Invite Alumni</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                    Send personalized invitations to alumni to join your institution's network.
                </p>
            </div>

            {success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm">
                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {success}
                </div>
            )}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold">{error}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <form onSubmit={handleSend} className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 space-y-5 shadow-sm">

                    {/* Email list */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-gray-700 font-bold">Recipient Email Addresses</label>
                            <button
                                type="button"
                                onClick={addEmail}
                                className="text-amber-600 hover:text-amber-700 text-xs flex items-center gap-1 font-bold transition-colors bg-amber-50 px-3 py-1 rounded-lg"
                            >
                                <Plus size={14} /> Add Email
                            </button>
                        </div>
                        <div className="space-y-2">
                            {emails.map((email, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-amber-400 transition-colors">
                                        <Mail size={14} className="text-gray-400 flex-shrink-0" />
                                        <input
                                            type="email"
                                            placeholder="alumni@example.com"
                                            value={email}
                                            onChange={e => updateEmail(idx, e.target.value)}
                                            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                                        />
                                    </div>
                                    {emails.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeEmail(idx)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <X size={15} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="text-xs text-gray-700 block mb-1.5 font-bold">Subject Line</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-amber-400 transition-colors"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-xs text-gray-700 block mb-1.5 font-bold">Invitation Message</label>
                        <textarea
                            placeholder="Write a personalized invitation message for the alumni..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            required
                            rows={7}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors resize-none leading-relaxed"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={sending || validEmails.length === 0}
                            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-md"
                        >
                            <Send size={16} />
                            {sending ? 'Sending...' : `Send Invitation${validEmails.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </form>

                {/* Preview sidebar */}
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Mail size={14} className="text-amber-500" /> Recipients Preview
                        </h3>
                        {validEmails.length === 0 ? (
                            <p className="text-gray-500 text-xs font-medium">No valid emails added yet.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {validEmails.map((em, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                        <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                                        <span className="truncate">{em}</span>
                                    </div>
                                ))}
                                <div className="pt-2 mt-2 border-t border-gray-100">
                                    <p className="text-gray-500 text-[10px] font-bold uppercase">{validEmails.length} recipient(s) will receive this invitation</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5">
                        <h3 className="text-xs font-bold text-gray-700 mb-3">ℹ️ Note</h3>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                            This is in <span className="text-amber-600 font-bold">demo mode</span>. Invitations are queued and logged. Configure an SMTP server or integrate SendGrid/Resend to enable real email delivery.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
