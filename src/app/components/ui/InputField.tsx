import React, { useEffect, useState, useCallback } from 'react';

export interface ValidationRule {
    type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom' | 'address';
    value?: number | string | RegExp;
    message: string;
    validator?: (value: string) => boolean;
}

export interface InputFormProps {
    label: string
    placeholder: string
    value?: string
    type?: string
    large?: boolean
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    isLoading?: boolean
    storageKey?: string
    validationRules?: ValidationRule[]
    required?: boolean
    maxLength?: number
    minLength?: number
    className?: string
    isAddress?: boolean
}

type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

export function InputForm({ 
    label, 
    placeholder, 
    value, 
    type = 'text',
    large, 
    onChange,
    isLoading = false,
    storageKey,
    validationRules = [],
    required = false,
    maxLength,
    minLength,
    className = '',
    isAddress = false
}: InputFormProps) {
    const [localValue, setLocalValue] = useState(value || '');
    const [errors, setErrors] = useState<string[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Función de debounce personalizada con tipos correctos
    const debounce = useCallback(<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): DebouncedFunction<T> => {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }, []);

    // Función para validar una dirección blockchain
    const isValidAddress = useCallback((address: string): boolean => {
        // Validación básica de dirección Ethereum
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }, []);

    // Función para validar el input
    const validateInput = useCallback((value: string) => {
        const newErrors: string[] = [];

        // Validación básica
        if (required && !value) {
            newErrors.push('Este campo es requerido');
        }

        if (minLength && value.length < minLength) {
            newErrors.push(`Mínimo ${minLength} caracteres`);
        }

        if (maxLength && value.length > maxLength) {
            newErrors.push(`Máximo ${maxLength} caracteres`);
        }

        // Validación de dirección blockchain
        if (isAddress && value && !isValidAddress(value)) {
            newErrors.push('Dirección inválida. Debe ser una dirección Ethereum válida (0x...)');
        }

        // Validaciones personalizadas
        validationRules.forEach(rule => {
            switch (rule.type) {
                case 'pattern':
                    if (rule.value instanceof RegExp && !rule.value.test(value)) {
                        newErrors.push(rule.message);
                    }
                    break;
                case 'custom':
                    if (rule.validator && !rule.validator(value)) {
                        newErrors.push(rule.message);
                    }
                    break;
                case 'address':
                    if (!isValidAddress(value)) {
                        newErrors.push(rule.message || 'Dirección inválida');
                    }
                    break;
            }
        });

        setErrors(newErrors);
        return newErrors.length === 0;
    }, [required, minLength, maxLength, validationRules, isAddress, isValidAddress]);

    // Debounced save to localStorage
    const debouncedSave = useCallback(
        debounce((value: string) => {
            if (storageKey) {
                localStorage.setItem(storageKey, value);
            }
        }, 500),
        [storageKey]
    );

    // Load from localStorage on mount
    useEffect(() => {
        if (storageKey) {
            const savedValue = localStorage.getItem(storageKey);
            if (savedValue) {
                setLocalValue(savedValue);
                if (onChange) {
                    const event = {
                        target: { value: savedValue }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                }
            }
        }
    }, [storageKey, onChange]);

    // Save to localStorage when value changes
    useEffect(() => {
        if (storageKey && value) {
            debouncedSave(value);
        }
    }, [value, storageKey, debouncedSave]);

    // Sync local value with prop value
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        setIsDirty(true);
        
        if (onChange) {
            onChange(e);
        }

        // Only validate if the field is dirty and has a value
        if (isDirty && newValue) {
            validateInput(newValue);
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        setIsDirty(true);
        // Only validate on blur if there's a value
        if (localValue) {
            validateInput(localValue);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const inputClasses = `
        w-full
        bg-gradient-to-br from-zinc-900/50 to-zinc-800/50
        backdrop-blur-sm
        py-4 px-6
        border-2
        ${errors.length > 0 ? 'border-red-500/50' : isFocused ? 'border-indigo-500/50' : 'border-zinc-700/50'}
        placeholder:text-zinc-200
        text-zinc-100
        text-lg
        shadow-lg
        rounded-xl
        focus:ring-[4px]
        focus:ring-indigo-500/20
        focus:border-indigo-500/50
        focus:outline-none
        transition-all
        duration-300
        hover:border-zinc-600/50
        hover:shadow-indigo-500/10
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
    `;

    return (
        <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <label className="text-zinc-800 font-medium text-sm tracking-wide">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {maxLength && (
                    <span className="text-zinc-500 text-sm">
                        {localValue.length}/{maxLength}
                    </span>
                )}
            </div>
            <div className="relative">
                {large ? (
                    <textarea
                        className={inputClasses}
                        placeholder={placeholder}
                        value={localValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        disabled={isLoading}
                        required={required}
                        maxLength={maxLength}
                        minLength={minLength}
                    />
                ) : (
                    <input
                        className={inputClasses}
                        type={type}
                        placeholder={placeholder}
                        value={localValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        disabled={isLoading}
                        required={required}
                        maxLength={maxLength}
                        minLength={minLength}
                    />
                )}
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                )}
            </div>
            {isDirty && errors.length > 0 && (
                <div className="space-y-1">
                    {errors.map((error, index) => (
                        <p key={index} className="text-red-500 text-sm">{error}</p>
                    ))}
                </div>
            )}
        </div>
    )
}