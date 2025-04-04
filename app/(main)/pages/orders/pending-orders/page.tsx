/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/navigation';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { useState } from 'react';

interface Customer {
    id: number;
    name: string;
}

interface Garment {
    id: number;
    name: string;
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

const PendingOrders = () => {
    const router = useRouter();
    const [showDialog, setShowDialog] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedGarments, setSelectedGarments] = useState<Garment[]>([]);
    const [isMaximized, setIsMaximized] = useState(true);

    const customers: Customer[] = [
        { id: 1, name: 'Nishant Kumar' },
        { id: 2, name: 'Rahul Sharma' },
        { id: 3, name: 'Aditi Saha' },
        { id: 4, name: 'Amit Singh' },
    ];

    const garments: Garment[] = [
        { id: 1, name: 'Shirt' },
        { id: 2, name: 'Pant' },
        { id: 3, name: 'Kurta Pajama' },
        { id: 4, name: 'Sherwani' },
        { id: 5, name: 'Blazer' },
    ];

    const orders: Order[] = [
        { id: 1001, cName: 'Nishant Kumar', orderType: 'Shirt', trialDate: '2023-05-15', deliveryDate: '2023-05-20', status: 'In Progress', amount: 1200, type: 'Active' },
        { id: 1002, cName: 'Rahul Sharma', orderType: 'Pant', trialDate: '2023-06-20', deliveryDate: '2023-06-25', status: 'Completed', amount: 800, type: 'Delivered' },
        { id: 1003, cName: 'Aditi Saha', orderType: 'Kurta Pajama', trialDate: '', deliveryDate: '2023-06-30', status: 'Accepted', amount: 1500, type: 'Draft' },
        { id: 1004, cName: 'Amit Singh', orderType: 'Sherwani', trialDate: '2023-07-10', deliveryDate: '2023-07-15', status: 'In Progress', amount: 2500, type: 'Active' },
    ];

    const handleAddOrder = () => {
        setShowDialog(true);
    };

    const handleCreateOrder = () => {
        router.push('/pages/orders/create-order');
    };

    return (
        <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
                <h2 className="text-2xl m-0">Orders</h2>
                <Button 
                    label="Create Order" 
                    icon="pi pi-plus" 
                    onClick={handleAddOrder}
                    className="w-full md:w-auto"
                    size="small"
                />
            </div>

            <Dialog 
                header="Create New Order" 
                visible={showDialog} 
                style={{ width: '50vw' }}
                maximized={isMaximized}
                onMaximize={(e) => setIsMaximized(e.maximized)}
                onHide={() => {
                    setShowDialog(false);
                    setSelectedCustomer(null);
                    setSelectedGarments([]);
                }}
            >
                <div className="p-fluid">
                    <div className="field mb-4">
                        <label htmlFor="customer">Customer</label>
                        <Dropdown
                            id="customer"
                            value={selectedCustomer}
                            options={customers}
                            onChange={(e: DropdownChangeEvent) => setSelectedCustomer(e.value)}
                            optionLabel="name"
                            placeholder="Select a Customer"
                            className="w-full"
                            filter
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="garments">Select Outfit</label>
                        <MultiSelect
                            id="garments"
                            value={selectedGarments}
                            options={garments}
                            onChange={(e: MultiSelectChangeEvent) => setSelectedGarments(e.value)}
                            optionLabel="name"
                            placeholder="Select Outfits"
                            className="w-full"
                            display="chip"
                            filter
                        />
                    </div>
                </div>

                <div className="flex justify-content-end gap-2 mt-4">
                    <Button 
                        label="Next" 
                        icon="pi pi-arrow-right" 
                        iconPos="right"
                        onClick={handleCreateOrder}
                        disabled={!selectedCustomer || selectedGarments.length === 0}
                    />
                </div>
            </Dialog>

            {orders.length > 0 ? (
                <div className="grid">
                    {orders.map((order) => (
                        <div key={order.id} className="col-12 md:col-6 lg:col-4 mb-3">
                            <Card className="shadow-1 hover:shadow-3 transition-shadow transition-duration-200 h-full">
                                <div className="flex flex-column gap-2 h-full">
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
                                    
                                    <div className="flex flex-column gap-2 flex-grow-1">
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
            ) : (
                <Card className="flex justify-content-center align-items-center py-8">
                    <div className="flex flex-column align-items-center gap-3">
                        <i className="pi pi-shopping-cart text-5xl text-400"></i>
                        <h3 className="text-xl text-600">No Orders Found</h3>
                        <p className="text-sm text-500">Create your first order by clicking the "Create Order" button</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default PendingOrders;