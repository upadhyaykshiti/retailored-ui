/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { TabView, TabPanel } from 'primereact/tabview';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    dob: string;
    address: string;
}

interface Order {
    id: number;
    cName: string;
    orderType: string;
    trialDate: string;
    deliveryDate: string;
    status: string;
    amount: number;
    type: 'Active' | 'Past Due' | 'Upcoming' | 'Pending Payment' | 'Delivered' | 'Draft';
}

interface Garment {
    id: number;
    name: string;
    measurements: string[];
    status: 'active' | 'inactive';
}

interface MeasurementValues {
    [garmentName: string]: {
      [measurement: string]: number | null;
    };
}  

const CustomerDetails = () => {
    const customer: Customer = {
        id: 1,
        name: 'Rajesh Kumar',
        email: 'rajesh@gmail.com',
        phone: '+911234567890',
        dob: '2000-03-01',
        address: 'Address not available',
    };

    const orders: Order[] = [
        { id: 1001, cName: 'Ramesh Kumar', orderType: 'Shirt', trialDate: '2023-05-15', deliveryDate: '2023-05-20', status: 'In Progress', amount: 1200, type: 'Active' },
        { id: 1002, cName: 'Rahul Kumar', orderType: 'Pant', trialDate: '2023-06-20', deliveryDate: '2023-06-25', status: 'Completed', amount: 800, type: 'Delivered' },
        { id: 1003, cName: 'Sahil Kumar', orderType: 'Kurta Pajama', trialDate: '', deliveryDate: '', status: 'Pending', amount: 1500, type: 'Draft' },
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

    const router = useRouter();
    const [selectedGarmentId, setSelectedGarmentId] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const [isMaximized, setIsMaximized] = useState(true);
    const [currentMeasurements, setCurrentMeasurements] = useState<{[key: string]: number | null}>({});
    const [allMeasurements, setAllMeasurements] = useState<MeasurementValues>({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
          const savedMeasurements = localStorage.getItem('garmentMeasurements');
          if (savedMeasurements) {
            setAllMeasurements(JSON.parse(savedMeasurements));
          }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('garments', JSON.stringify(garments));
        }
    }, [garments]);
    
      useEffect(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('garmentMeasurements', JSON.stringify(allMeasurements));
        }
    }, [allMeasurements]);

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
    };

    const measurementFooter = (
        <div>
          <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
          <Button label="Save" icon="pi pi-check" onClick={handleSaveMeasurements} autoFocus />
        </div>
    );

    const getSelectedGarmentName = () => {
        return garments.find(g => g.id === selectedGarmentId)?.name || '';
    };

    return (
        <div className="grid p-2">
            <div className="col-12 flex align-items-center gap-2">
                <Button 
                    icon="pi pi-arrow-left" 
                    severity="secondary"
                    onClick={() => router.back()} 
                    className="p-button-text"
                />
                <h2 className="m-0 text-2xl font-500">Customer Details</h2>
            </div>
            <div className="col-12 md:col-3">
                <Card className="h-full">
                    <div className="flex flex-column align-items-center gap-3 mb-2">
                        <Avatar 
                            label={customer.name.charAt(0).toUpperCase()}
                            size="xlarge" 
                            shape="circle" 
                            className="shadow-4 text-xl font-semibold bg-primary text-white" 
                        />
                        <span className="text-2xl font-bold">{customer.name}</span>
                        
                        <div className="flex justify-content-center gap-4 mt-2">
                            <Button 
                                icon="pi pi-whatsapp" 
                                rounded 
                                severity="success"
                            />
                            <Button 
                                icon="pi pi-envelope" 
                                rounded 
                                severity="info"
                            />
                        </div>
                    </div>

                    <Divider />

                    <div className="flex flex-column gap-3">
                        <div className="flex align-items-center gap-3">
                            <i className="pi pi-phone text-500" style={{ fontSize: '1.2rem' }}></i>
                            <div>{customer.phone}</div>
                        </div>

                        <div className="flex align-items-center gap-3">
                            <i className="pi pi-envelope text-500" style={{ fontSize: '1.2rem' }}></i>
                            <div>{customer.email}</div>
                        </div>

                        <div className="flex align-items-center gap-3">
                            <i className="pi pi-calendar text-500" style={{ fontSize: '1.2rem' }}></i>
                            <div>{customer.dob}</div>
                        </div>

                        <div className="flex align-items-center gap-3">
                            <i className="pi pi-map-marker text-500" style={{ fontSize: '1.2rem' }}></i>
                            <div>{customer.address}</div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12 md:col-9">
                <Card>
                    <TabView>
                        <TabPanel header="Orders">
                            <div className="mb-4">
                                <Divider align="left">
                                    <span className="text-600 font-medium">Outfit Status</span>
                                </Divider>
                            </div>

                            <div className="grid">
                                {orders.map((order) => (
                                <div key={order.id} className="col-12 mb-3">
                                    <Card className="shadow-1 hover:shadow-3 transition-shadow transition-duration-200">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between align-items-center">
                                            <div>
                                                <span className="font-bold block">Order #{order.id}</span>
                                                <span className="text-sm text-500">{order.cName}</span>
                                            </div>
                                        <Tag 
                                            value={order.status} 
                                            severity={
                                            order.status === 'Completed' ? 'success' : 
                                            order.status === 'In Progress' ? 'info' : 'warning'
                                            }
                                        />
                                        </div>

                                        <Divider className="my-2" />
                                        
                                        <div className="flex flex-column gap-1">
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Customer</span>
                                                <span>{order.cName}</span>
                                            </div>

                                            <div className="flex justify-content-between">
                                                <span className="text-500">Order Type</span>
                                                <span>{order.orderType}</span>
                                            </div>
                                            
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Trial Date:</span>
                                                <span>{order.trialDate || '-'}</span>
                                            </div>
                                            
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Delivery Date:</span>
                                                <span>{order.deliveryDate || '-'}</span>
                                            </div>
                                            
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Amount:</span>
                                                <span className="font-bold text-primary">₹{order.amount.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    </Card>
                                </div>
                                ))}
                            </div>
                        </TabPanel>

                        <TabPanel header="Measurements">
                            <div className="p-4">
                                <h4 className="mb-4">Measurements</h4>
                                
                                <div className="mb-5">
                                    <label className="block text-500 font-medium mb-2">Select Outfit Type:</label>
                                    <div className="grid">
                                        {garments.filter(g => g.status === 'active').map((garment) => (
                                        <div key={garment.id} className="col-6 sm:col-4 md:col-3 lg:col-2 text-center mb-4">
                                            <div 
                                            className="p-3 border-round cursor-pointer transition-all transition-duration-200 bg-surface border-1 border-transparent hover:bg-gray-100"
                                            onClick={() => openMeasurementDialog(garment.id)}
                                            >
                                            <div className="flex flex-column align-items-center gap-3">
                                                <img 
                                                src={`https://s3.us-east-1.amazonaws.com/darzee.backend.static/OutfitType/OutfitType/${garment.name.toLowerCase().replace(/\s+/g, '_')}.png`}
                                                alt={garment.name}
                                                className="w-8rem h-8rem shadow-2"
                                                style={{ 
                                                    borderRadius: '4px',
                                                    padding: '8px',
                                                    boxSizing: 'border-box',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://s3.us-east-1.amazonaws.com/darzee.backend.static/OutfitType/OutfitType/kurta_pajama.png';
                                                }}
                                                />
                                                <span className="font-medium">{garment.name}</span>
                                            </div>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Dialog 
                                header={`${getSelectedGarmentName()} Measurements`}
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
                        </TabPanel>
                    </TabView>
                </Card>
            </div>
        </div>
    );
};

export default CustomerDetails;