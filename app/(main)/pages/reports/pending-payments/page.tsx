/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Dialog } from 'primereact/dialog';

interface PendingPayment {
  id: number;
  orderNumber: string;
  orderDate: string;
  dueDate: string;
  amount: number;
  status: 'overdue' | 'pending' | 'paid';
  customerId: number;
}

interface Customer {
  id: number;
  name: string;
  mobile: string;
}

const PendingPayments = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMaximized, setIsMaximized] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, name: 'Nishant Kumar', mobile: '+91 1234567890' },
    { id: 2, name: 'Rahul Sharma', mobile: '+91 9876543210' },
    { id: 3, name: 'Priya Patel', mobile: '+91 8765432109' }
  ]);

  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([
    {
      id: 101,
      orderNumber: 'ORD-2023-001',
      orderDate: '2023-05-15',
      dueDate: '2023-06-15',
      amount: 2500,
      status: 'overdue',
      customerId: 1
    },
    {
      id: 102,
      orderNumber: 'ORD-2023-005',
      orderDate: '2023-06-01',
      dueDate: '2023-07-01',
      amount: 2000,
      status: 'pending',
      customerId: 1
    },
    {
      id: 103,
      orderNumber: 'ORD-2023-008',
      orderDate: '2023-06-10',
      dueDate: '2023-07-10',
      amount: 3200,
      status: 'pending',
      customerId: 2
    },
    {
      id: 104,
      orderNumber: 'ORD-2023-003',
      orderDate: '2023-05-20',
      dueDate: '2023-06-20',
      amount: 1500,
      status: 'overdue',
      customerId: 3
    }
  ]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile.includes(searchTerm)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const getCustomerPayments = (customerId: number) => {
    return pendingPayments.filter(payment => payment.customerId === customerId);
  };

  const getTotalPending = (customerId: number) => {
    return pendingPayments
      .filter(payment => payment.customerId === customerId)
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getSeverity = (status: string) => {
    if (status === 'overdue') return 'danger';
    if (status === 'pending') return 'warning';
    return 'success';
  };

  const getOverdueCount = (customerId: number) => {
    return pendingPayments.filter(p => p.customerId === customerId && p.status === 'overdue').length;
  };

  const openDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogVisible(true);
  };

  return (
    <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0">Pending Payments</h2>
        <span className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="w-full"
          />
        </span>
      </div>

      <div className="flex flex-wrap gap-3 lg:justify-content-start">
        {filteredCustomers.map((customer) => {
          const customerPayments = getCustomerPayments(customer.id);
          const totalPending = getTotalPending(customer.id);
          const overdueCount = getOverdueCount(customer.id);

          return (
            <Card
              key={customer.id}
              className="flex flex-column w-full sm:w-20rem lg:w-22rem"
            >
              <div className="flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="text-xl m-0">{customer.name}</h3>
                  <p className="text-sm text-500 mt-1">{customer.mobile}</p>
                </div>
                <Tag
                  value={formatCurrency(totalPending)}
                  severity="warning"
                  className="align-self-start"
                />
              </div>

              <div className="flex flex-column gap-2 mb-3">
                <div className="flex justify-content-between">
                  <span className="text-500">Pending Orders:</span>
                  <span>{customerPayments.length}</span>
                </div>
                <div className="flex justify-content-between">
                  <span className="text-500">Overdue:</span>
                  <span>{overdueCount}</span>
                </div>
              </div>

              <Button
                label="View Details"
                icon="pi pi-eye"
                onClick={() => openDialog(customer)}
                className="w-full p-button-sm"
              />
            </Card>
          );
        })}
      </div>

      <Dialog
        header="Payment Details"
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className="w-full"
        blockScroll
      >
       {selectedCustomer && (
        <div className="flex justify-content-between align-items-center mb-4">
            <div className="font-medium text-xl">{selectedCustomer.name}</div>
            <Tag
            value={`${formatCurrency(getTotalPending(selectedCustomer.id))}`}
            severity="warning"
            />
        </div>
        )}

        <div className="flex flex-column gap-3">
          {selectedCustomer && getCustomerPayments(selectedCustomer.id).map((payment) => (
            <Card key={payment.id} className="mb-2 shadow-2">
              <div className="flex justify-content-between mb-2">
                <span className="font-medium">Order No:</span>
                <span>{payment.orderNumber}</span>
              </div>
              <div className="flex justify-content-between mb-2">
                <span className="font-medium">Order Date:</span>
                <span>{payment.orderDate}</span>
              </div>
              <div className="flex justify-content-between mb-2">
                <span className="font-medium">Due Date:</span>
                <span>{payment.dueDate}</span>
              </div>
              <div className="flex justify-content-between mb-2">
                <span className="font-medium">Amount:</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-content-between">
                <span className="font-medium">Status:</span>
                <Tag
                  value={payment.status.toUpperCase()}
                  severity={getSeverity(payment.status)}
                />
              </div>
            </Card>
          ))}
        </div>
      </Dialog>
    </div>
  );
};

export default PendingPayments;