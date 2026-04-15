import React, { useState, useRef } from 'react';
import { X, ShieldCheck } from 'lucide-react';

export default function OTPModal({ isOpen, onClose, onSubmit }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  if (!isOpen) return null;

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto advance
    if (val && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(otp.join(''));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm px-4">
      <div className="bg-panels border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        
        <h2 className="text-xl font-display font-bold text-center mb-2">Patient Authorization</h2>
        <p className="text-text-secondary text-sm text-center mb-8">Enter the 6-digit OTP provided by the patient to decrypt their records.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(el) => (inputs.current[i] = el)}
                className="w-12 h-14 text-center text-xl font-display font-bold bg-subtle border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-text-primary"
              />
            ))}
          </div>
          
          <button type="submit" disabled={otp.join('').length < 6} className="btn-primary w-full">
            Verify & Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
