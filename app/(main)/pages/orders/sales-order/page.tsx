/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { useState } from 'react';

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isMaximized, setIsMaximized] = useState(true);
  const [visible, setVisible] = useState(false);

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

  return (
    <div className="p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 className="text-2xl m-0 mb-3">Sales Orders</h2>
      
      <div className="grid">
        {orders.map((order) => (
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
        ))}
      </div>

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