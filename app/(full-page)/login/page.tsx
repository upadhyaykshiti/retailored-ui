/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';

const LoginPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [step, setStep] = useState<'login' | 'otp'>('login');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(119);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendAttempts, setResendAttempts] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_RESEND_ATTEMPTS = 3;

    const roles = [
        { label: 'Admin', value: 'admin' },
        { label: 'Jobber', value: 'jobber' },
        { label: 'Vendor', value: 'vendor' },
        { label: 'Customer', value: 'customer' }
    ];

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handleOtpChange = (value: string, index: number) => {
        if (value.length > 1) {
            const newOtp = [...otp];
            const characters = value.split('').slice(0, otp.length);
            characters.forEach((char, i) => {
                if (/^\d$/.test(char)) {
                    newOtp[index + i] = char;
                }
            });
            setOtp(newOtp);
    
            const otpValue = newOtp.join('');
            if (otpValue.length === 6 && /^\d{6}$/.test(otpValue)) {
                handleVerifyOtp(otpValue);
            }
            return;
        }
    
        if (!/^\d?$/.test(value)) return;
    
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
    
        if (value && index < otp.length - 1) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) {
                (nextInput as HTMLInputElement).focus();
            }
        }
    
        const otpValue = newOtp.join('');
        if (otpValue.length === 6 && /^\d{6}$/.test(otpValue)) {
            handleVerifyOtp(otpValue);
        }
    };

    const handleSubmitMobile = () => {
        if (!selectedRole) {
            toast.current?.show({ severity: 'warn', summary: 'Role Required', detail: 'Please select your role', life: 3000 });
            return;
        }
        
        if (mobileNumber.length !== 10) {
            toast.current?.show({ severity: 'warn', summary: 'Invalid Number', detail: 'Please enter a valid 10-digit mobile number', life: 3000 });
            return;
        }
        
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('otp');
            setTimer(119);
            startTimer();
            toast.current?.show({ 
                severity: 'success', 
                summary: 'OTP Sent', 
                detail: `An OTP is sent to +91-${mobileNumber}`, 
                life: 3000 
            });
        }, 1500);
    };

    const startTimer = () => {
        setIsDisabled(true);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    setIsDisabled(false);
                    setIsResending(false);
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleVerifyOtp = async (otpValue?: string) => {
        const finalOtp = otpValue || otp.join('');
        if (finalOtp.length !== 6 || !/^\d{6}$/.test(finalOtp)) {
            toast.current?.show({ severity: 'warn', summary: 'Invalid OTP', detail: 'Please enter a valid 6-digit OTP', life: 3000 });
            return;
        }
    
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.current?.show({ 
                severity: 'success', 
                summary: 'Success', 
                detail: 'OTP successfully validated!', 
                life: 3000 
            });
            router.push('/');
        }, 1500);
    };

    const handleResend = () => {
        if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
            toast.current?.show({ 
                severity: 'warn', 
                summary: 'Limit Exceeded', 
                detail: 'Max OTP resend attempts reached. Please try again later.', 
                life: 3000 
            });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsResending(true);
            setResendAttempts(resendAttempts + 1);
            setOtp(['', '', '', '', '', '']);
            setTimer(119);
            startTimer();
            toast.current?.show({ 
                severity: 'success', 
                summary: 'OTP Resent', 
                detail: `An OTP is resent to +91-${mobileNumber}`, 
                life: 3000 
            });
        }, 1000);
    };

    const handleBack = () => {
        setStep('login');
        setOtp(['', '', '', '', '', '']);
        setIsDisabled(false);
        setTimer(119);
        setIsResending(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen p-4">
            <Toast ref={toast} />
            <div className="w-full max-w-25rem">
                <div className="text-center mb-5">
                    <Link href="#">
                        <img 
                            src="/layout/images/reTailoredLogo.jpg" 
                            alt="Logo" 
                            className="mb-1 w-4rem" 
                        />
                        <h3 className="text-800 font-bold m-0 mb-5">reTailored</h3>
                    </Link>
                    
                    <h2 className="text-900 text-xl font-bold mt-3 mb-1">
                        {step === 'login' ? 'Login to continue' : 'Verify OTP'}
                    </h2>
                    <p className="text-600 font-medium">
                        {step === 'login' ? 'Enter your details' : `Enter the 6-digit code sent to +91 ${mobileNumber}`}
                    </p>
                </div>

                {step === 'login' && (
                    <div className="flex flex-column gap-4">
                        <div className="flex flex-column gap-3">
                            <label htmlFor="role" className="text-600 font-medium">
                                Select Role
                            </label>
                            <Dropdown
                                id="role"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.value)}
                                options={roles}
                                optionLabel="label"
                                placeholder="Select your role"
                                className="w-full"
                                dropdownIcon="pi pi-chevron-down"
                            />
                        </div>

                        <div className="flex flex-column gap-2">
                            <label htmlFor="mobile" className="text-600 font-medium">
                                Mobile Number
                            </label>
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon bg-white">+91</span>
                                <InputText
                                    id="mobile"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Enter 10-digit mobile number"
                                    className="w-full p-3"
                                    maxLength={10}
                                    keyfilter="int"
                                />
                            </div>
                        </div>

                        <Button 
                            label="Send OTP" 
                            className="w-full p-3" 
                            loading={isLoading}
                            disabled={!selectedRole || mobileNumber.length !== 10}
                            onClick={handleSubmitMobile}
                        />
                    </div>
                )}

                {step === 'otp' && (
                    <div className="flex flex-column gap-4">
                        <div className="flex justify-content-between gap-2 mb-4">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <InputText
                                    key={index}
                                    id={`otp-${index}`}
                                    value={otp[index]}
                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                    className="text-center p-2"
                                    style={{ fontSize: '1.2rem', width: '3rem', height: '3rem' }}
                                    maxLength={1}
                                    keyfilter="int"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                            const prevInput = document.getElementById(`otp-${index - 1}`);
                                            if (prevInput) {
                                                (prevInput as HTMLInputElement).focus();
                                            }
                                        }
                                    }}
                                    onPaste={(e) => {
                                        const pasteData = e.clipboardData.getData('Text');
                                        handleOtpChange(pasteData, index);
                                        e.preventDefault();
                                    }}
                                />
                            ))}
                        </div>

                        <Button 
                            label="Verify & Login" 
                            className="w-full p-3" 
                            loading={isLoading}
                            disabled={otp.some(digit => !digit)}
                            onClick={() => handleVerifyOtp()}
                        />

                        <div className="flex justify-content-center gap-2">
                            <span className="text-600">Didn&apos;t receive code?</span>
                            <Button 
                                label="Resend" 
                                className="p-button-text p-0" 
                                onClick={() => {
                                    setOtp(Array(6).fill(''));
                                }}
                            />
                        </div>

                        <Button 
                            label="Back" 
                            className="w-full p-3 p-button-outlined p-button-secondary" 
                            onClick={handleBack}
                        />
                    </div>
                )}

                <div className="text-center mt-4">
                    <p className="text-600 text-sm">
                        By continuing, you agree to our{' '}
                        <Button 
                            label="Terms" 
                            className="p-button-text p-0 text-sm" 
                            onClick={() => console.log('Terms clicked')}
                        />{' '}and{' '}
                        <Button 
                            label="Privacy Policy" 
                            className="p-button-text p-0 text-sm" 
                            onClick={() => console.log('Privacy clicked')}
                        />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;