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
import { Galleria } from 'primereact/galleria';
import { Sidebar } from 'primereact/sidebar';
import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';

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

interface AdditionalCost {
    id: string;
    description: string;
    amount: number;
  }

const CreateOrder = () => {
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
    const [showStitchOptionsDialog, setShowStitchOptionsDialog] = useState(false);
    const [collarOption, setCollarOption] = useState<string | null>(null);
    const [sleeveOption, setSleeveOption] = useState<string | null>(null);
    const [bottomOption, setBottomOption] = useState<string | null>(null);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [visibleGalleria, setVisibleGalleria] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [imageUploadRef, setImageUploadRef] = useState<HTMLInputElement | null>(null);
    const [pocketOption, setPocketOption] = useState('');
    const [pocketSquareOption, setPocketSquareOption] = useState('');
    const [cuffsOption, setCuffsOption] = useState('');
    const [showCustomerDialog, setShowCustomerDialog] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showImageSourceDialog, setShowImageSourceDialog] = useState(false);
    const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
    const [showAddCostDialog, setShowAddCostDialog] = useState(false);
    const [newCostDescription, setNewCostDescription] = useState('');
    const [newCostAmount, setNewCostAmount] = useState<number | null>(null);
    const [showOutfitSelectionDialog, setShowOutfitSelectionDialog] = useState(false);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([
        { id: 1, name: 'Arjun Khanna', phone: '+91 9876543210' },
        { id: 2, name: 'Rahul Sharma', phone: '+91 8765432109' },
        { id: 3, name: 'Priya Patel', phone: '+91 7654321098' },
        { id: 4, name: 'Amit Singh', phone: '+91 6543210987' },
        { id: 5, name: 'Neha Gupta', phone: '+91 9432109876' },
        { id: 6, name: 'Vikram Joshi', phone: '+91 8321098765' },
        { id: 7, name: 'Ananya Reddy', phone: '+91 7210987654' },
        { id: 8, name: 'Rohan Malhotra', phone: '+91 6109876543' },
        { id: 9, name: 'Sanya Verma', phone: '+91 5098765432' },
        { id: 10, name: 'Aman Khanna', phone: '+91 4987654321' }
    ]);

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

    const allGarments: Garment[] = [
        { id: 1, name: 'Formal Shirt', measurements: ['Chest', 'Length', 'Sleeve'], price: 1200 },
        { id: 2, name: 'Formal Pant', measurements: ['Waist', 'Length', 'Hip'], price: 800 },
        { id: 3, name: 'Kurta', measurements: ['Chest', 'Length', 'Shoulder'], price: 1500 },
        { id: 4, name: 'Pajama', measurements: ['Waist', 'Length'], price: 600 },
        { id: 5, name: 'Blazer', measurements: ['Chest', 'Shoulder', 'Length'], price: 2500 },
        { id: 6, name: 'Waistcoat', measurements: ['Chest', 'Length'], price: 1000 },
    ];

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowCustomerDialog(false);
        setCustomerSearch('');
    };

    const handleClearCustomer = () => {
        setSelectedCustomer(null);
    };

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

    const handleOutfitSelection = (garment: Garment) => {
        setSelectedGarments(prev => {
            const isSelected = prev.some(g => g.id === garment.id);
            const newSelection = isSelected 
                ? prev.filter(g => g.id !== garment.id)
                : [...prev, garment];
            
            return newSelection;
        });
    };

    const handleImageSourceSelect = async (source: 'camera' | 'gallery') => {
        setShowImageSourceDialog(false);
        try {
          const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
          });
      
          if (image.webPath) {
            setUploadedImages(prev => [...prev, image.webPath!]);
          } else if (image.path) {
            const file = await Filesystem.readFile({
              path: image.path!,
              directory: Directory.Cache,
            });
            const base64Image = `data:image/jpeg;base64,${file.data}`;
            setUploadedImages(prev => [...prev, base64Image]);
          }
        } catch (error) {
          console.error('Error capturing image:', error);
        }
      };
      
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          const files = Array.from(e.target.files);
          const newImages = await Promise.all(
            files.map(async (file) => {
              return URL.createObjectURL(file);
            })
          );
          setUploadedImages(prev => [...prev, ...newImages]);
        }
    };
      
    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };     
    
    const itemTemplate = (item: string) => {
        return (
            <img 
                src={item} 
                alt="Uploaded reference" 
                style={{ width: '100%', display: 'block' }}
            />
        );
    };
    
    const thumbnailTemplate = (item: string) => {
        return (
            <img 
                src={item} 
                alt="Uploaded reference thumbnail" 
                style={{ width: '100%', display: 'block' }}
            />
        );
    };
    const showToast = async (message: string) => {
        await Toast.show({ 
          text: message,
          duration: 'long',
          position: 'top'
        });
      };   

    const handleConfirmOrder = async () => {        
      try {
        if (!selectedCustomer) {
          await showToast('Please select a customer first');
          return;
        }
        
        if (selectedGarments.length === 0) {
          await showToast('Please add at least one outfit');
          return;
        }
        
        await showToast('Order confirmed successfully!');
        
      } catch (error) {
        console.error('Error confirming order:', error);
        await showToast('Failed to confirm order. Please try again.');
      }
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

    const stitchFooter = (
        <div>
          <Button label="Cancel" icon="pi pi-times" onClick={() => setShowStitchOptionsDialog(false)} className="p-button-text" />
          <Button label="Save" icon="pi pi-check" onClick={() => setShowStitchOptionsDialog(false)} autoFocus />
        </div>
    );

    return (
        <div className="flex flex-column p-3 lg:p-5 mb-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="text-2xl m-0 mb-3">Create Order</h2>
            <Card className="mb-4">
                <div className="flex flex-column gap-2 p-3 surface-50 border-round">
                    {selectedCustomer ? (
                        <div className="flex flex-column gap-2">
                            <div className="flex justify-content-between align-items-center">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-user text-500"></i>
                                    <span className="font-bold">{selectedCustomer.name}</span>
                                </div>
                                <Button 
                                    icon="pi pi-times" 
                                    rounded 
                                    text 
                                    severity="secondary"
                                    tooltip="Change customer"
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={handleClearCustomer}
                                />
                            </div>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-phone text-500"></i>
                                <span>{selectedCustomer.phone}</span>
                            </div>
                        </div>
                    ) : (
                        <Button 
                            label="Select Customer" 
                            icon="pi pi-user-plus" 
                            className="p-button-outlined w-full" 
                            onClick={() => setShowCustomerDialog(true)}
                        />
                    )}
                </div>
            </Card>

            <Divider />

            <div className="main-selected-outfit mb-5">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h3 className="text-lg m-0">Selected Outfits</h3>
                    <Button 
                        label="Add Outfit" 
                        icon="pi pi-plus" 
                        onClick={() => setShowOutfitSelectionDialog(true)}
                        size="small"
                    />
                </div>

                {selectedGarments.length > 0 ? (
                    <div className="grid">
                        {selectedGarments.map((garment) => (
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
                                                    onClick={() => handleOutfitSelection(garment)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-column align-items-center justify-content-center py-4 gap-3" style={{ minHeight: '25vh' }}>
                        <i className="pi pi-shopping-bag text-4xl text-400" style={{ fontSize: '2.5rem' }}></i>
                        <p className="text-500 font-medium text-xl">No outfits added</p>
                    </div>
                )}
            </div>

            <Dialog 
                header="Select Customer" 
                visible={showCustomerDialog} 
                onHide={() => {
                    setShowCustomerDialog(false);
                    setCustomerSearch('');
                }}
                style={{ width: '95vw', maxWidth: '600px' }}
                maximized={isMaximized}
                onMaximize={(e) => setIsMaximized(e.maximized)}
                className={isMaximized ? 'maximized-dialog' : ''}
                blockScroll
            >
                <div className="p-fluid">
                    <div className="field p-3 sticky top-0 bg-white z-1 border-bottom-1 surface-border">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                                placeholder="Search customers..."
                                className="w-full"
                            />
                        </span>
                    </div>

                    <div style={{ overflowY: 'auto' }}>
                        {allCustomers
                            .filter(c => 
                                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                c.phone.includes(customerSearch)
                            )
                            .map((customer: Customer) => (
                                <div 
                                    key={customer.id} 
                                    className={`p-3 border-bottom-1 surface-border cursor-pointer flex justify-content-between align-items-center ${
                                        selectedCustomer?.id === customer.id ? 'bg-blue-50' : 'hover:surface-50'
                                    }`}
                                    onClick={() => handleSelectCustomer(customer)}
                                >
                                    <div>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-sm text-500">{customer.phone}</div>
                                    </div>
                                    {selectedCustomer?.id === customer.id && (
                                        <i className="pi pi-check text-primary"></i>
                                    )}
                                </div>
                            ))
                        }

                        {allCustomers.filter(c => 
                            c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                            c.phone.includes(customerSearch)
                        ).length === 0 && (
                            <div className="p-5 text-center text-500">
                                No matching customers found
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>

            <Sidebar
                visible={showOutfitSelectionDialog}
                onHide={() => setShowOutfitSelectionDialog(false)}
                position="bottom"
                style={{ 
                    width: '100%',
                    height: '60vh',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
                }}
                className="outfit-selector-sidebar"
                header={
                    <div className="sticky top-0 bg-white z-1 p-3 surface-border flex justify-content-between align-items-center">
                        <span className="font-bold text-2xl">Select Outfits</span>
                    </div>
                }
                blockScroll
            >
                <div className="flex flex-column">
                    {allGarments.map((garment) => {
                        const isSelected = selectedGarments.some(g => g.id === garment.id);
                        return (
                            <div 
                                key={garment.id}
                                className="flex justify-content-between align-items-center p-3 border-bottom-1 surface-border cursor-pointer hover:surface-100 transition-duration-150"
                                onClick={() => handleOutfitSelection(garment)}
                            >
                                <span className="font-medium text-900">{garment.name}</span>
                                <i className={`pi ${isSelected ? 'pi-check-circle text-primary' : 'pi-plus-circle'} text-2xl`} />
                            </div>
                        );
                    })}
                </div>
            </Sidebar>

            <Dialog 
                header='Create Order' 
                visible={showCreateDialog}
                onHide={() => { setShowCreateDialog(false); resetDialog(); }}
                maximized={isMaximized}
                onMaximize={(e) => setIsMaximized(e.maximized)}
                className={isMaximized ? 'maximized-dialog' : ''}
                blockScroll
                footer={dialogFooter}
            >
                <div className="p-fluid">
                    <div className="field my-4">
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
                                                onClick={() => setShowStitchOptionsDialog(true)}
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
                        <div>
                            <input 
                                type="file" 
                                ref={ref => setImageUploadRef(ref)}
                                onChange={handleFileUpload}
                                multiple 
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <Button 
                                icon="pi pi-image" 
                                label="Upload Image" 
                                className="p-button-outlined w-7" 
                                onClick={() => setShowImageSourceDialog(true)}
                            />
                        </div>

                        {uploadedImages.length > 0 && (
                            <div className="flex overflow-x-auto pb-2" style={{ gap: '0.75rem' }}>
                                {uploadedImages.map((image, index) => (
                                    <div key={index} className="relative flex-shrink-0" style={{ width: '120px' }}>
                                        <div className="border-1 surface-border border-round p-2 h-full">
                                            <img 
                                                src={image} 
                                                alt={`Uploaded ${index + 1}`} 
                                                className="w-full border-round cursor-pointer" 
                                                style={{ height: '80px', objectFit: 'cover' }}
                                                onClick={() => {
                                                    setActiveIndex(index);
                                                    setVisibleGalleria(true);
                                                }}
                                            />
                                            <Button 
                                                icon="pi pi-trash" 
                                                className="p-button-rounded p-button-danger p-button-text absolute" 
                                                style={{ top: '4px', right: '4px', width: '1.5rem', height: '1.5rem' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(index);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                value={stitchingPrice || undefined} 
                                onValueChange={(e) => setStitchingPrice(e.value ?? 0)} 
                                mode="currency" 
                                currency="INR" 
                                locale="en-IN" 
                                className="w-full"
                                placeholder="Enter amount"
                                minFractionDigits={2}
                                maxFractionDigits={2}
                            />
                        </div>

                        <div className="field">
                            <Button 
                                label="Add Additional Cost" 
                                icon="pi pi-plus" 
                                className="p-button-outlined w-8" 
                                onClick={() => setShowAddCostDialog(true)}
                            />
                        </div>
                    </div>

                    <div className="surface-50 p-3 border-round mt-4">
                        <h5 className="mt-0 mb-3">Price Breakup</h5>
                        <Divider className="my-2" />
                        
                        <div className="flex justify-content-between align-items-center mb-3">
                            <span className="text-600">Stitching Price</span>
                            <span>{quantity} x ₹{stitchingPrice} = ₹{(quantity * stitchingPrice).toFixed(2)}</span>
                        </div>

                        {additionalCosts.map((cost) => (
                            <div key={cost.id} className="flex justify-content-between align-items-center">
                            <div className="flex align-items-center gap-2">
                                <span className="text-600">{cost.description}</span>
                                <Button 
                                icon="pi pi-trash" 
                                className="p-button-rounded p-button-text p-button-danger p-button-sm" 
                                onClick={() => setAdditionalCosts(additionalCosts.filter(c => c.id !== cost.id))}
                                />
                            </div>
                            <span>₹{cost.amount.toFixed(2)}</span>
                            </div>
                        ))}
                        
                        <Divider className="my-2" />
                        
                        <div className="flex justify-content-between align-items-center font-bold">
                            <span className="text-600">Total:</span>
                            <span>
                            ₹{(
                                (quantity * stitchingPrice) + 
                                additionalCosts.reduce((sum, cost) => sum + cost.amount, 0)
                            ).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog 
                header={`${currentGarment?.name} Measurements`}
                visible={visible} 
                maximized={isMaximized}
                onMaximize={(e) => setIsMaximized(e.maximized)}
                footer={measurementFooter}
                onHide={() => setVisible(false)}
                blockScroll
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

            <Dialog 
                header="Stitch Options" 
                visible={showStitchOptionsDialog} 
                maximized={isMaximized}
                onMaximize={(e) => setIsMaximized(e.maximized)}
                footer={stitchFooter}
                onHide={() => setShowStitchOptionsDialog(false)}
                className={isMaximized ? 'maximized-dialog' : ''}
                blockScroll
            >
                <div className="p-fluid">
                    <div className="mb-4">
                        <div className="surface-100 p-3 border-round mb-3">
                            <h5 className="m-0 font-medium">Top</h5>
                        </div>
                        
                        <div className="field mb-4">
                            <h5 className="m-0 mb-3">Collar</h5>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="collar1" 
                                        name="collar" 
                                        value="Mandarin" 
                                        onChange={(e) => setCollarOption(e.value)} 
                                        checked={collarOption === 'Mandarin'} 
                                    />
                                    <label htmlFor="collar1" className="ml-2">Mandarin</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="collar2" 
                                        name="collar" 
                                        value="Stand" 
                                        onChange={(e) => setCollarOption(e.value)} 
                                        checked={collarOption === 'Stand'} 
                                    />
                                    <label htmlFor="collar2" className="ml-2">Stand</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="collar3" 
                                        name="collar"
                                        value="Classic" 
                                        onChange={(e) => setCollarOption(e.value)} 
                                        checked={collarOption === 'Classic'} 
                                    />
                                    <label htmlFor="collar3" className="ml-2">Classic</label>
                                </div>
                            </div>
                        </div>

                        <Divider className="my-3" />

                        <div className="field mb-4">
                            <h5 className="m-0 mb-3">Pockets</h5>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="pocket1" 
                                        name="pocket" 
                                        value="Straight" 
                                        onChange={(e) => setPocketOption(e.value)} 
                                        checked={pocketOption === 'Straight'} 
                                    />
                                    <label htmlFor="pocket1" className="ml-2">Straight</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="pocket2" 
                                        name="pocket" 
                                        value="Slant" 
                                        onChange={(e) => setPocketOption(e.value)} 
                                        checked={pocketOption === 'Slant'} 
                                    />
                                    <label htmlFor="pocket2" className="ml-2">Slant</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="pocket3" 
                                        name="pocket" 
                                        value="Patch" 
                                        onChange={(e) => setPocketOption(e.value)} 
                                        checked={pocketOption === 'Patch'} 
                                    />
                                    <label htmlFor="pocket3" className="ml-2">Patch</label>
                                </div>
                            </div>
                        </div>

                        <Divider className="my-3" />

                        <div className="field mb-4">
                            <h5 className="m-0 mb-3">Pocket Square</h5>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="pocketSquare1" 
                                        name="pocketSquare" 
                                        value="Yes" 
                                        onChange={(e) => setPocketSquareOption(e.value)} 
                                        checked={pocketSquareOption === 'Yes'} 
                                    />
                                    <label htmlFor="pocketSquare1" className="ml-2">Yes</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="pocketSquare2" 
                                        name="pocketSquare" 
                                        value="No" 
                                        onChange={(e) => setPocketSquareOption(e.value)} 
                                        checked={pocketSquareOption === 'No'} 
                                    />
                                    <label htmlFor="pocketSquare2" className="ml-2">No</label>
                                </div>
                            </div>
                        </div>

                        <Divider className="my-3" />

                        <div className="field mb-4">
                            <h5 className="m-0 mb-3">Cuffs</h5>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="cuffs1" 
                                        name="cuffs" 
                                        value="Yes" 
                                        onChange={(e) => setCuffsOption(e.value)} 
                                        checked={cuffsOption === 'Yes'} 
                                    />
                                    <label htmlFor="cuffs1" className="ml-2">Yes</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="cuffs2" 
                                        name="cuffs" 
                                        value="No" 
                                        onChange={(e) => setCuffsOption(e.value)} 
                                        checked={cuffsOption === 'No'} 
                                    />
                                    <label htmlFor="cuffs2" className="ml-2">No</label>
                                </div>
                            </div>
                        </div>

                        <Divider className="my-3" />

                        <div className="field">
                            <h5 className="m-0 mb-3">Sleeves</h5>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="sleeve1" 
                                        name="sleeve" 
                                        value="Full" 
                                        onChange={(e) => setSleeveOption(e.value)} 
                                        checked={sleeveOption === 'Full'} 
                                    />
                                    <label htmlFor="sleeve1" className="ml-2">Full</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="sleeve2" 
                                        name="sleeve" 
                                        value="Half" 
                                        onChange={(e) => setSleeveOption(e.value)} 
                                        checked={sleeveOption === 'Half'} 
                                    />
                                    <label htmlFor="sleeve2" className="ml-2">Half</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="sleeve3" 
                                        name="sleeve" 
                                        value="Three Quarter" 
                                        onChange={(e) => setSleeveOption(e.value)} 
                                        checked={sleeveOption === 'Three Quarter'} 
                                    />
                                    <label htmlFor="sleeve3" className="ml-2">Three Quarter</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="surface-100 p-3 border-round mb-3">
                            <h5 className="m-0 font-medium">Bottom</h5>
                        </div>
                        
                        <div className="field mb-4">
                            <h5 className="m-0 mb-3">Pants/Pyjamas</h5>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="bottom3" 
                                        name="bottom" 
                                        value="Straight" 
                                        onChange={(e) => setBottomOption(e.value)} 
                                        checked={bottomOption === 'Straight'} 
                                    />
                                    <label htmlFor="bottom3" className="ml-2">Straight</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton 
                                        inputId="bottom4" 
                                        name="bottom" 
                                        value="Slant" 
                                        onChange={(e) => setBottomOption(e.value)} 
                                        checked={bottomOption === 'Slant'} 
                                    />
                                    <label htmlFor="bottom4" className="ml-2">Slant</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog 
                visible={showImageSourceDialog} 
                onHide={() => setShowImageSourceDialog(false)}
                style={{ width: '95vw', maxWidth: '400px' }}
            >
                <div className="flex flex-column gap-3 p-3">
                <Button 
                    icon="pi pi-camera" 
                    label="Take Photo" 
                    className="p-button-outlined" 
                    onClick={() => handleImageSourceSelect('camera')}
                />
                <Button 
                    icon="pi pi-images" 
                    label="Choose from Gallery" 
                    className="p-button-outlined" 
                    onClick={() => handleImageSourceSelect('gallery')}
                />
                <Button 
                    icon="pi pi-folder-open" 
                    label="Choose Files" 
                    className="p-button-outlined" 
                    onClick={() => {
                    setShowImageSourceDialog(false);
                    imageUploadRef?.click();
                    }}
                />
                </div>
            </Dialog>

            <Dialog 
                header="Add Additional Cost" 
                visible={showAddCostDialog} 
                onHide={() => {
                    setShowAddCostDialog(false);
                    setNewCostDescription('');
                    setNewCostAmount(null);
                }}
                style={{ width: '95vw', maxWidth: '800px' }}
                footer={
                    <div>
                    <Button 
                        label="Cancel" 
                        icon="pi pi-times" 
                        onClick={() => {
                        setShowAddCostDialog(false);
                        setNewCostDescription('');
                        setNewCostAmount(null);
                        }} 
                        className="p-button-text" 
                    />
                    <Button 
                        label="Add" 
                        icon="pi pi-check" 
                        onClick={() => {
                        if (newCostDescription && newCostAmount) {
                            setAdditionalCosts([
                            ...additionalCosts,
                            {
                                id: Date.now().toString(),
                                description: newCostDescription,
                                amount: newCostAmount
                            }
                            ]);
                            setShowAddCostDialog(false);
                            setNewCostDescription('');
                            setNewCostAmount(null);
                        }
                        }} 
                        autoFocus 
                    />
                    </div>
                }
                >
                <div className="p-fluid">
                    <div className="field my-4">
                        <label htmlFor="costDescription">Title</label>
                        <InputText 
                            id="costDescription" 
                            value={newCostDescription} 
                            onChange={(e) => setNewCostDescription(e.target.value)} 
                            className="w-full" 
                            placeholder="e.g., Embroidery, Special Fabric, etc." 
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="costAmount">Amount (₹)</label>
                        <InputNumber 
                            id="costAmount" 
                            value={newCostAmount} 
                            onValueChange={(e) => setNewCostAmount(e.value ?? null)} 
                            mode="currency" 
                            currency="INR" 
                            locale="en-IN" 
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2 border-top-1 surface-border">
                <div className="flex justify-content-between align-items-center p-3 surface-100">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">₹0.00</span>
                </div>
                <div className="p-3">
                    <Button 
                        label="Confirm Order"
                        onClick={handleConfirmOrder}
                        className="w-full"
                        disabled={!selectedCustomer || selectedGarments.length === 0}
                    />
                </div>
            </div>

            <Dialog
                visible={activeIndex !== null}
                style={{ width: '95vw', maxWidth: '800px' }}
                onHide={() => setActiveIndex(null)}
                modal
            >
                <Galleria
                    value={uploadedImages}
                    activeIndex={activeIndex ?? 0}
                    onItemChange={(e) => setActiveIndex(e.index)}
                    showThumbnails={false}
                    showIndicators
                    item={itemTemplate}
                    thumbnail={thumbnailTemplate}
                    circular
                    autoPlay={false}
                />
            </Dialog>
        </div>
    );
};

export default CreateOrder;