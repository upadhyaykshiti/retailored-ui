/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { useState } from 'react';

interface JobOrder {
  id: number;
  jobOrderNumber: string;
  jobberName: string;
  orderDate: Date;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  trialDate: Date | null;
  notes: string;
  totalQty: number;
  deliveredQty: number;
  cancelledQty: number;
  items: JobOrderItem[];
}

interface JobOrderItem {
  id: number;
  name: string;
  salesOrderNo: string;
  customerName: string;
  trialDate: Date | null;
  pendingQty: number;
  cancelledQty: number;
  notes: string;
  imageUrl?: string;
}

const JobOrder = () => {
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrder | null>(null);
  const [isMaximized, setIsMaximized] = useState(true);
  const [visible, setVisible] = useState(false);

  const jobOrders: JobOrder[] = [
    {
      id: 1,
      jobOrderNumber: 'JOB-2023-001',
      jobberName: 'Tailor Master',
      orderDate: new Date('2023-05-16'),
      status: 'In Progress',
      trialDate: new Date('2023-05-25'),
      notes: 'Premium fabric used',
      totalQty: 3,
      deliveredQty: 1,
      cancelledQty: 0,
      items: [
        {
          id: 1,
          name: 'Formal Shirt',
          salesOrderNo: 'ORD-2023-001',
          customerName: 'Nishant Kumar',
          trialDate: new Date('2023-05-20'),
          pendingQty: 2,
          cancelledQty: 0,
          notes: 'French cuffs required',
          imageUrl: '/shirt.jpg'
        }
      ]
    },
    {
      id: 2,
      jobOrderNumber: 'JOB-2023-002',
      jobberName: 'Stitch Well',
      orderDate: new Date('2023-05-18'),
      status: 'Pending',
      trialDate: null,
      notes: 'Special embroidery needed',
      totalQty: 2,
      deliveredQty: 0,
      cancelledQty: 0,
      items: [
        {
          id: 2,
          name: 'Designer Kurta',
          salesOrderNo: 'ORD-2023-002',
          customerName: 'Rahul Sharma',
          trialDate: null,
          pendingQty: 2,
          cancelledQty: 0,
          notes: 'Hand embroidery with zari'
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

  const openJobOrderDetails = (jobOrder: JobOrder) => {
    setSelectedJobOrder(jobOrder);
    setVisible(true);
  };

  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleDateString('en-IN') : 'Not scheduled';
  };

  return (
    <div className="p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 className="text-2xl m-0 mb-3">Job Orders</h2>
      
      <div className="grid">
        {jobOrders.map((jobOrder) => (
          <div key={jobOrder.id} className="col-12 md:col-6 lg:col-4">
            <Card className="h-full">
              <div className="flex flex-column gap-2">
              <div className="flex justify-content-between align-items-center">
                  <span className="font-bold">{jobOrder.jobOrderNumber}</span>
                  <Tag value={jobOrder.status} severity={getStatusSeverity(jobOrder.status)} />
                </div>
                
                <Divider className="my-2" />
                
                <div className="flex flex-column gap-1">
                  <div className="flex justify-content-between">
                    <span className="text-600">Jobber:</span>
                    <span>{jobOrder.jobberName}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-600">Order Date:</span>
                    <span>{formatDate(jobOrder.orderDate)}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-600">Trial Date:</span>
                    <span>{formatDate(jobOrder.trialDate)}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-600">Total Qty:</span>
                    <span>{jobOrder.totalQty}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-600">Delivered:</span>
                    <span>{jobOrder.deliveredQty}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-600">Cancelled:</span>
                    <span>{jobOrder.cancelledQty}</span>
                  </div>
                </div>
                
                <Divider className="my-2" />
                
                <div className="flex flex-column gap-1">
                  <span className="text-600">Notes:</span>
                  <p className="m-0 text-sm">{jobOrder.notes || 'No notes'}</p>
                </div>
                
                <div className="mt-3">
                  <Button 
                    label="View Details" 
                    icon="pi pi-eye" 
                    onClick={() => openJobOrderDetails(jobOrder)}
                    className="w-full p-button-sm"
                  />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Dialog 
        header={`Order Details - ${selectedJobOrder?.jobOrderNumber}`} 
        visible={visible} 
        onHide={() => setVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className="w-full"
        blockScroll
      >
        {selectedJobOrder && (
          <div className="p-fluid">
            <div className="grid">
              <div className="col-6">
                <div className="field">
                  <label>Jobber</label>
                  <p className="m-0 font-medium">{selectedJobOrder.jobberName}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Order Date</label>
                  <p className="m-0 font-medium">{formatDate(selectedJobOrder.orderDate)}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Status</label>
                  <Tag value={selectedJobOrder.status} severity={getStatusSeverity(selectedJobOrder.status)} />
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Trial Date</label>
                  <p className="m-0 font-medium">{formatDate(selectedJobOrder.trialDate)}</p>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <h5 className="m-0 mb-3">Job Items</h5>
            
            {selectedJobOrder.items.map((item) => (
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
                      <label>Sales Order No</label>
                      <p className="m-0 font-medium">{item.salesOrderNo}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Customer Name</label>
                      <p className="m-0 font-medium">{item.customerName}</p>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default JobOrder;