/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { RadioButton } from 'primereact/radiobutton';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { useState } from 'react';

interface Customer {
    id: number;
    name: string;
    phone: string;
}

interface Garment {
    id: number;
    name: string;
    measurements: string[];
    price: number;
}

interface MeasurementValues {
    [garmentName: string]: {
      [measurement: string]: number | null;
    };
}  

const CreateOrderPage = () => {
    const [selectedGarmentId, setSelectedGarmentId] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const [selectedGarments, setSelectedGarments] = useState<Garment[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [currentGarment, setCurrentGarment] = useState<Garment | null>(null);
    const [type, setType] = useState('stitching');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
    const [trialDate, setTrialDate] = useState<Date | null>(null);
    const [isPriority, setIsPriority] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [stitchingPrice, setStitchingPrice] = useState(0);
    const [inspiration, setInspiration] = useState('');
    const [isMaximized, setIsMaximized] = useState(true);
    const [currentMeasurements, setCurrentMeasurements] = useState<{[key: string]: number | null}>({});
    const [allMeasurements, setAllMeasurements] = useState<MeasurementValues>({});
    const [isMesurementSaved, setIsMesurementSaved] = useState(false);

    const selectedCustomer: Customer = {
        id: 1,
        name: 'Nishant Kumar',
        phone: '+91 1234567890'
    };

    const allGarments: Garment[] = [
        { id: 1, name: 'Shirt', measurements: ['Chest', 'Length', 'Sleeve'], price: 1200 },
        { id: 2, name: 'Pant', measurements: ['Waist', 'Length', 'Hip'], price: 800 },
    ];

    const [garments, setGarments] = useState<Garment[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('garments');
            return saved ? JSON.parse(saved) : [
                { id: 1, name: 'Kurta Pajama', measurements: ['Length', 'Chest', 'Shoulder'], status: 'active' },
                { id: 2, name: 'Pajama', measurements: ['Waist', 'Length', 'Hip'], status: 'active' },
                { id: 3, name: 'Shirt', measurements: ['Chest', 'Length', 'Sleeve'], status: 'inactive' }
                ];
            }
            return [];
        });

    const totalAmount = selectedGarments.reduce((sum, garment) => sum + garment.price, 0);

    const handleAddOutfit = (garment: Garment) => {
        setCurrentGarment(garment);
        setShowCreateDialog(true);
    };

    const openMeasurementDialog = (garmentId: number) => {
        const selectedGarment = garments.find(g => g.id === garmentId);
        if (selectedGarment) {
          setSelectedGarmentId(garmentId);
          
          const savedValues = allMeasurements[garmentId] || {};
          const initialValues: {[key: string]: number | null} = {};
          
          selectedGarment.measurements.forEach(measurement => {
            initialValues[measurement] = savedValues[measurement] || null;
          });
          
          setCurrentMeasurements(initialValues);
          setVisible(true);
        }
    };

    const handleMeasurementChange = (measurement: string, value: number | null) => {
        setCurrentMeasurements(prev => ({
          ...prev,
          [measurement]: value
        }));
    };

    const handleSaveMeasurements = () => {
        if (selectedGarmentId !== null) {
          setAllMeasurements(prev => ({
            ...prev,
            [selectedGarmentId]: {
              ...prev[selectedGarmentId],
              ...currentMeasurements
            }
          }));
        }
        setVisible(false);
        setIsMesurementSaved(true);
    };

    const handleSaveOrder = () => {
        if (currentGarment) {
            setSelectedGarments([...selectedGarments, currentGarment]);
            setShowCreateDialog(false);
            resetDialog();
        }
    };

    const resetDialog = () => {
        setType('stitching');
        setSpecialInstructions('');
        setDeliveryDate(null);
        setTrialDate(null);
        setIsPriority(false);
        setQuantity(1);
        setStitchingPrice(0);
        setInspiration('');
    };

    const dialogFooter = (
        <div className="mt-3">
            <Button label="Save" className="w-full" onClick={handleSaveOrder} autoFocus />
        </div>
    );

    const measurementFooter = (
        <div>
          <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
          <Button label="Save" icon="pi pi-check" onClick={handleSaveMeasurements} autoFocus />
        </div>
    );

    return (
        <div className="flex flex-column p-3 lg:p-5 mb-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="text-2xl m-0 mb-3">Create Order</h2>
            <Card className="mb-4">
                <div className="flex flex-column gap-2 p-3 surface-50 border-round">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user text-500"></i>
                        <span className="font-bold font-medium">{selectedCustomer.name}</span>
                    </div>
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-phone text-500"></i>
                        <span>{selectedCustomer.phone}</span>
                    </div>
                </div>
            </Card>

            <Divider />

            <div className="main-selected-outfit mb-5">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h3 className="text-lg m-0">Selected Outfits</h3>
                    <Button 
                        label="Add Outfit" 
                        icon="pi pi-plus" 
                        onClick={() => {}} 
                        size="small"
                    />
                </div>

                {allGarments.length > 0 ? (
                    <div className="grid">
                        {allGarments.map((garment) => (
                            <div key={garment.id} className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="font-medium">{garment.name}</span>
                                            <div className="flex gap-2">
                                                <Button 
                                                    icon="pi pi-plus" 
                                                    rounded
                                                    text
                                                    severity="success"
                                                    onClick={() => handleAddOutfit(garment)}
                                                />
                                                <Button 
                                                    icon="pi pi-trash" 
                                                    rounded
                                                    text 
                                                    severity="danger"
                                                    onClick={() => setSelectedGarments(
                                                        selectedGarments.filter(g => g.id !== garment.id)
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-column align-items-center py-4 gap-2">
                        <i className="pi pi-box text-4xl text-400"></i>
                        <p className="text-500">No outfits selected</p>
                    </div>
                )}
            </div>

            <Dialog 
                header='Create Order' 
                visible={showCreateDialog} 
                onHide={() => { setShowCreateDialog(false); resetDialog(); }}
                maximized={isMaximized}
                onMaximize={(e) => setIsMaximized(e.maximized)}
                className="w-full"
                blockScroll
                footer={dialogFooter}
            >
                <div className="p-fluid">
                    <div className="field mb-4">
                        <h4 className="m-0 text-900 font-medium">{currentGarment?.name}</h4>
                    </div>

                    <div className="field mb-4">
                        <label>Type</label>
                        <div className="flex gap-3 mt-2">
                            <div className="flex align-items-center">
                                <RadioButton inputId="stitching" name="type" value="stitching" onChange={(e) => setType(e.value)} checked={type === 'stitching'} />
                                <label htmlFor="stitching" className="ml-2">Stitching</label>
                            </div>
                            <div className="flex align-items-center">
                                <RadioButton inputId="alteration" name="type" value="alteration" onChange={(e) => setType(e.value)} checked={type === 'alteration'} />
                                <label htmlFor="alteration" className="ml-2">Alteration</label>
                            </div>
                        </div>
                    </div>

                    {type === 'stitching' && (
                        <>
                            <div className="flex flex-column gap-3 mb-4">
                                <div className="flex flex-column gap-2">
                                    <div className="flex align-items-center">
                                        <span className="font-medium w-9">Add Measurements</span>
                                        <div className="w-3 text-right">
                                           {isMesurementSaved ? (
                                                <Button 
                                                    label="Edit"
                                                    icon="pi pi-pencil" 
                                                    onClick={() => openMeasurementDialog(1)}
                                                    className="p-button-sm p-button-outlined"
                                                />
                                            ) : (
                                                <Button 
                                                    label="Add"
                                                    icon="pi pi-plus" 
                                                    onClick={() => openMeasurementDialog(1)}
                                                    className="p-button-sm p-button-outlined"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-column gap-2">
                                    <div className="flex align-items-center">
                                        <span className="font-medium w-9">Stitch Options</span>
                                        <div className="w-3 text-right">
                                            <Button 
                                            label="Add" 
                                            icon="pi pi-plus" 
                                            onClick={() => console.log('Add Stitch Options clicked')}
                                            className="p-button-sm p-button-outlined"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="field mb-4">
                        <label htmlFor="instructions">Special Instructions</label>
                        <InputTextarea 
                            id="instructions" 
                            rows={3} 
                            value={specialInstructions} 
                            onChange={(e) => setSpecialInstructions(e.target.value)} 
                            placeholder="Write instructions..." 
                            className="w-full" 
                        />
                    </div>

                    <div className="flex flex-column gap-4 mb-4">
                        <Button 
                            icon="pi pi-microphone" 
                            label="Record Audio" 
                            className="p-button-outlined w-7" 
                        />
                        <Button 
                            icon="pi pi-image" 
                            label="Upload Image" 
                            className="p-button-outlined w-7" 
                        />
                    </div>

                    <div className="field mb-4">
                        <label htmlFor="inspiration">Add Inspiration</label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-link" />
                            <InputText
                                id="inspiration"
                                value={inspiration}
                                onChange={(e) => setInspiration(e.target.value)}
                                className="w-full"
                                placeholder="Add Inspiration"
                            />
                        </span>
                    </div>

                    <div className="flex flex-column gap-3 mb-4">
                        <div className="field">
                            <label htmlFor="deliveryDate">Delivery Date</label>
                            <Calendar
                            id="deliveryDate"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.value as Date)}
                            dateFormat="dd/mm/yy |"
                            className="w-full"
                            showIcon
                            showTime
                            hourFormat="12"
                            placeholder="Select Delivery Date"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="trialDate">Trial Date</label>
                            <Calendar
                            id="trialDate"
                            value={trialDate}
                            onChange={(e) => setTrialDate(e.value as Date)}
                            dateFormat="dd/mm/yy |"
                            className="w-full"
                            showIcon
                            showTime
                            hourFormat="12"
                            placeholder="Select Trial Date"
                            />
                        </div>
                        </div>

                    <div className="field mb-4 flex align-items-center">
                        <Checkbox 
                            inputId="priority" 
                            checked={isPriority} 
                            onChange={(e) => setIsPriority(e.checked ?? false)} 
                        />
                        <label htmlFor="priority" className="ml-2 mb-0">Prioritize Order</label>
                    </div>

                    <Divider />

                    <div className="flex flex-column gap-3">
                        <div className="field">
                            <label htmlFor="quantity">Quantity</label>
                            <InputNumber 
                            id="quantity" 
                            value={quantity} 
                            onValueChange={(e) => setQuantity(e.value || 1)} 
                            mode="decimal" 
                            showButtons 
                            min={1} 
                            max={100} 
                            className="w-full" 
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="price">Stitching Price (₹)</label>
                            <InputNumber 
                            id="price" 
                            value={stitchingPrice} 
                            onValueChange={(e) => setStitchingPrice(e.value || 0)} 
                            mode="currency" 
                            currency="INR" 
                            locale="en-IN" 
                            className="w-full" 
                            />
                        </div>

                        <div className="field">
                            <Button 
                                label="Add Additional Cost" 
                                icon="pi pi-plus" 
                                className="p-button-outlined w-8" 
                                onClick={() => console.log('Add additional cost clicked')}
                            />
                        </div>
                    </div>

                    <div className="surface-50 p-3 border-round mt-4">
                        <h5 className="mt-0 mb-3">Price Breakup</h5>
                        <Divider className="my-2" />
                        
                        <div className="flex justify-content-between align-items-center mb-4">
                            <span className="text-600">Stiching Price</span>
                            <span>{quantity} x ₹{stitchingPrice} = ₹{(quantity * stitchingPrice).toFixed(2)}</span>
                        </div>
                        
                        <Divider className="my-2" />
                        
                        <div className="flex justify-content-between align-items-center font-bold">
                            <span className="text-600">Total:</span>
                            <span>₹{(quantity * stitchingPrice).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog 
                header={`${currentGarment?.name} Measurements`}
                visible={visible} 
                maximized={isMaximized}
                footer={measurementFooter}
                onHide={() => setVisible(false)}
                blockScroll
                onMaximize={(e) => setIsMaximized(e.maximized)}
            >
                <div className="p-fluid">
                {selectedGarmentId && garments.find(g => g.id === selectedGarmentId)?.measurements.map((measurement) => (
                    <div key={measurement} className="field mb-4">
                    <label htmlFor={measurement} className="block mb-2 font-medium">{measurement} (in inches)</label>
                    <InputNumber 
                        id={measurement}
                        value={currentMeasurements[measurement] || null}
                        onChange={(e) => handleMeasurementChange(measurement, e.value)}
                        mode="decimal" 
                        min={0} 
                        max={100}
                        className="w-full"
                    />
                    </div>
                ))}
                </div>
            </Dialog>

            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2 border-top-1 surface-border">
                <div className="flex justify-content-between align-items-center p-3 surface-100">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">₹{totalAmount.toFixed(1)}</span>
                </div>
                <div className="p-3">
                    <Button 
                        label="Confirm Order"
                        onClick={() => {}}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateOrderPage;