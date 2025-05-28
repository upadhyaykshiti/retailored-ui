/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { AuthService } from '@/demo/service/auth.service';
import { Toast } from '@capacitor/toast';

const LoginPage = () => {
    const router = useRouter();
    const [step, setStep] = useState<'login' | 'otp'>('login');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(119);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendAttempts, setResendAttempts] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_RESEND_ATTEMPTS = 3;

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

    const handleSubmitMobile = async () => {
        if (mobileNumber.length !== 10) return;

        setIsLoading(true);
        try {
            const timeout = setTimeout(async () => {
                const response = await AuthService.login(mobileNumber);
                await Toast.show({
                    text: `OTP: ${response.otp} (for testing)`,
                    duration: 'long',
                    position: 'top',
                });
            }, 5000);

            await AuthService.login(mobileNumber);
            clearTimeout(timeout);
            
            setStep('otp');
            setTimer(119);

            await Toast.show({
                text: `An OTP is sent to +91-${mobileNumber}`,
                duration: 'short',
                position: 'bottom',
            });
        } catch (error) {
            await Toast.show({
                text: 'Failed to send OTP. Try again.',
                duration: 'short',
                position: 'bottom',
            });

        } finally {
            setIsLoading(false);
        }
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
            await Toast.show({
                text: 'Please enter a valid 6-digit OTP',
                duration: 'short',
                position: 'bottom',
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await AuthService.otpVerify(mobileNumber, finalOtp);
            localStorage.setItem('authToken', res.token);
            router.push('/pages/dashboard');
        } catch (error) {
            await Toast.show({
                text: 'The OTP you entered is incorrect.',
                duration: 'short',
                position: 'bottom',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
        await Toast.show({
            text: 'Max OTP resend attempts reached. Please try again later.',
            duration: 'short',
            position: 'bottom',
        });
            return;
        }

        setIsLoading(true);
        try {
            const timeout = setTimeout(async () => {
                const response = await AuthService.login(mobileNumber);
                await Toast.show({
                    text: `OTP: ${response.otp} (for testing)`,
                    duration: 'long',
                    position: 'top',
                });
            }, 5000);

            await AuthService.login(mobileNumber);
            clearTimeout(timeout);
            
            setOtp(['', '', '', '', '', '']);
            setTimer(119);
            startTimer();
            setIsResending(true);
            setResendAttempts(prev => prev + 1);

            await Toast.show({
                text: `An OTP is resent to +91-${mobileNumber}`,
                duration: 'short',
                position: 'bottom',
            });
        } catch (error) {
            await Toast.show({
                text: 'Could not resend OTP. Try again.',
                duration: 'short',
                position: 'bottom',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setStep('login');
        setOtp(['', '', '', '', '', '']);
        setIsDisabled(false);
        setTimer(119);
        setIsResending(false);
        setMobileNumber('');
        setResendAttempts(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen p-4">
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
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && mobileNumber.length === 10) {
                                            handleSubmitMobile();
                                        }
                                    }}
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
                            disabled={mobileNumber.length !== 10}
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
                            {isDisabled ? (
                                <span className="text-600 font-medium">Resend in {timer}s</span>
                            ) : (
                                <Button 
                                    label="Resend" 
                                    className="p-button-text p-0" 
                                    onClick={handleResend}
                                    disabled={isLoading || isDisabled}
                                />
                            )}
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