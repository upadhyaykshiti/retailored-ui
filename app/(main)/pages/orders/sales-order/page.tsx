/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/navigation';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { useState, useMemo } from 'react';

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
  orderNumber: string;
  customerName: string;
  orderDate: Date;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  trialDate: Date | null;
  notes: string;
  totalQty: number;
  deliveredQty: number;
  cancelledQty: number;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  name: string;
  jobOrderNo: string;
  jobberName: string;
  trialDate: Date | null;
  pendingQty: number;
  cancelledQty: number;
  notes: string;
  imageUrl?: string;
}

const SalesOrder = () => {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedGarments, setSelectedGarments] = useState<Garment[]>([]);
  const [isMaximized, setIsMaximized] = useState(true);
  const [visible, setVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const customers: Customer[] = [
    { id: 1, name: 'Nishant Kumar' },
    { id: 2, name: 'Rahul Sharma' },
    { id: 3, name: 'Priya Mehta' },
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
    {
      id: 1,
      orderNumber: 'ORD-2023-001',
      customerName: 'Nishant Kumar',
      orderDate: new Date('2023-05-15'),
      status: 'In Progress',
      trialDate: new Date('2023-05-25'),
      notes: 'Urgent delivery required',
      totalQty: 5,
      deliveredQty: 2,
      cancelledQty: 0,
      items: [
        {
          id: 1,
          name: 'Formal Shirt',
          jobOrderNo: 'JOB-001',
          jobberName: 'Tailor Master',
          trialDate: new Date('2023-05-20'),
          pendingQty: 3,
          cancelledQty: 0,
          notes: 'Need French cuffs',
          imageUrl: '/shirt.jpg'
        },
        {
          id: 2,
          name: 'Formal Pants',
          jobOrderNo: 'JOB-002',
          jobberName: 'Stitch Well',
          trialDate: null,
          pendingQty: 2,
          cancelledQty: 0,
          notes: 'Slim fit required',
          imageUrl: '/shirt.jpg'
        }
      ]
    },
    {
      id: 2,
      orderNumber: 'ORD-2023-002',
      customerName: 'Rahul Sharma',
      orderDate: new Date('2023-05-18'),
      status: 'Pending',
      trialDate: null,
      notes: 'Special fabric provided',
      totalQty: 3,
      deliveredQty: 0,
      cancelledQty: 1,
      items: [
        {
          id: 3,
          name: 'Kurta',
          jobOrderNo: 'JOB-003',
          jobberName: 'Ethnic Stitches',
          trialDate: null,
          pendingQty: 2,
          cancelledQty: 1,
          notes: 'Hand embroidery needed'
        }
      ]
    }
  ];

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'danger';
      default: return null;
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setVisible(true);
  };

  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleDateString('en-IN') : 'Not scheduled';
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    
    const term = searchTerm.toLowerCase();
    return orders.filter(order => 
      order.orderNumber.toLowerCase().includes(term) ||
      order.customerName.toLowerCase().includes(term) ||
      order.status.toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

  const handleAddOrder = () => {
    setShowDialog(true);
  };

  const handleCreateOrder = () => {
    router.push('/pages/orders/create-order');
  };

  return (
    <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
     <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
      <h2 className="text-2xl m-0">Sales Orders</h2>
        <span className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="w-full"
          />
        </span>
        <Button 
            label="Create Order" 
            icon="pi pi-plus" 
            onClick={handleAddOrder}
            className="w-full md:w-auto"
            size="small"
        />
      </div>
      
      <div className="grid">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="col-12 md:col-6 lg:col-4">
              <Card className="h-full">
                <div className="flex flex-column gap-2">
                  <div className="flex justify-content-between align-items-center">
                    <span className="font-bold">{order.orderNumber}</span>
                    <Tag value={order.status} severity={getStatusSeverity(order.status)} />
                  </div>
                  
                  <Divider className="my-2" />
                  
                  <div className="flex flex-column gap-1">
                    <div className="flex justify-content-between">
                      <span className="text-600">Customer:</span>
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Order Date:</span>
                      <span>{formatDate(order.orderDate)}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Trial Date:</span>
                      <span>{formatDate(order.trialDate)}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Total Qty:</span>
                      <span>{order.totalQty}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Delivered:</span>
                      <span>{order.deliveredQty}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Cancelled:</span>
                      <span>{order.cancelledQty}</span>
                    </div>
                  </div>
                  
                  <Divider className="my-2" />
                  
                  <div className="flex flex-column gap-1">
                    <span className="text-600">Notes:</span>
                    <p className="m-0 text-sm">{order.notes || 'No notes'}</p>
                  </div>
                  
                  <div className="mt-3">
                    <Button 
                      label="View Details" 
                      icon="pi pi-eye"
                      onClick={() => openOrderDetails(order)}
                      className="w-full p-button-sm"
                    />
                  </div>
                </div>
              </Card>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="p-4 text-center surface-100 border-round">
              <i className="pi pi-search text-3xl mb-1" />
              <h4>No orders found</h4>
            </div>
          </div>
        )}
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

      <Dialog 
        header={`Order Details - ${selectedOrder?.orderNumber}`} 
        visible={visible} 
        onHide={() => setVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className="w-full"
        blockScroll
      >
        {selectedOrder && (
          <div className="p-fluid">
            <div className="grid">
              <div className="col-6">
                <div className="field">
                  <label>Customer</label>
                  <p className="m-0 font-medium">{selectedOrder.customerName}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Order Date</label>
                  <p className="m-0 font-medium">{formatDate(selectedOrder.orderDate)}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Status</label>
                  <Tag value={selectedOrder.status} severity={getStatusSeverity(selectedOrder.status)} />
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Trial Date</label>
                  <p className="m-0 font-medium">{formatDate(selectedOrder.trialDate)}</p>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <h5 className="m-0 mb-3">Order Items</h5>
            
            {selectedOrder.items.map((item) => (
              <div key={item.id} className="mb-4 surface-50 p-3 border-round">
                <div className="grid">
                  <div className="col-6">
                    <div className="field">
                      <label>Item Name</label>
                      <p className="m-0 font-medium">{item.name}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Job Order No</label>
                      <p className="m-0 font-medium">{item.jobOrderNo}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Jobber Name</label>
                      <p className="m-0 font-medium">{item.jobberName}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Trial Date</label>
                      <p className="m-0 font-medium">{formatDate(item.trialDate)}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Pending Qty</label>
                      <p className="m-0 font-medium">{item.pendingQty}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Cancelled Qty</label>
                      <p className="m-0 font-medium">{item.cancelledQty}</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="field">
                      <label>Notes</label>
                      <p className="m-0 font-medium">{item.notes || 'No notes'}</p>
                    </div>
                  </div>
                  
                  {item.imageUrl && (
                    <div className="col-12 mt-3">
                      <Button 
                        label="View Image" 
                        icon="pi pi-image" 
                        onClick={() => window.open(item.imageUrl, '_blank')}
                        className="p-button-outlined"
                      />
                    </div>
                  )}
                  <Divider />
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default SalesOrder;