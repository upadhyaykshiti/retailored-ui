/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { useState, useRef, useCallback } from 'react';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { JobOrderService } from '@/demo/service/job-order.service';

interface PendingPayment {
  id: number;
  orderNumber: string;
  orderDate: string;
  dueDate: string;
  amount: number;
  status: 'overdue' | 'pending' | 'paid';
  customerId: number;
  paymentType: 'SO' | 'JO';
}

interface Customer {
  id: number;
  name: string;
  mobile: string;
}

const PendingPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMaximized, setIsMaximized] = useState(true);
  const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPaymentForRecord, setSelectedPaymentForRecord] = useState<PendingPayment | null>(null);
  const [paymentModes, setPaymentModes] = useState<{id: string, mode_name: string}[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useRef<Toast>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    paymentMethod: null
  });

  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, name: 'Aman Kumar', mobile: '+91 1234567890' },
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
      customerId: 1,
      paymentType: 'SO'
    },
    {
      id: 102,
      orderNumber: 'ORD-2023-005',
      orderDate: '2023-06-01',
      dueDate: '2023-07-01',
      amount: 2000,
      status: 'pending',
      customerId: 1,
      paymentType: 'JO'
    },
    {
      id: 103,
      orderNumber: 'ORD-2023-008',
      orderDate: '2023-06-10',
      dueDate: '2023-07-10',
      amount: 3200,
      status: 'pending',
      customerId: 2,
      paymentType: 'SO'
    },
    {
      id: 104,
      orderNumber: 'ORD-2023-003',
      orderDate: '2023-05-20',
      dueDate: '2023-06-20',
      amount: 1500,
      status: 'overdue',
      customerId: 3,
      paymentType: 'JO'
    }
  ]);

  const fetchPaymentModes = useCallback(async () => {
    try {
      const modes = await JobOrderService.getPaymentModes();
      setPaymentModes(modes);
    } catch (error) {
      console.error('Error fetching payment modes:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch payment methods',
        life: 3000
      });
    }
  }, []);

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

  const getCustomerPayments = (customerId: number, type: 'SO' | 'JO' | 'all' = 'all') => {
    return pendingPayments.filter(payment => 
      payment.customerId === customerId && 
      (type === 'all' || payment.paymentType === type)
    );
  };

  const getTotalPending = (customerId: number, type: 'SO' | 'JO' | 'all' = 'all') => {
    return pendingPayments
      .filter(payment => 
        payment.customerId === customerId && 
        (type === 'all' || payment.paymentType === type)
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getSeverity = (status: string) => {
    if (status === 'overdue') return 'danger';
    if (status === 'pending') return 'warning';
    return 'success';
  };

  const getOverdueCount = (customerId: number, type: 'SO' | 'JO' | 'all' = 'all') => {
    return pendingPayments.filter(p => 
      p.customerId === customerId && 
      p.status === 'overdue' && 
      (type === 'all' || p.paymentType === type)
    ).length;
  };
  
  const renderCustomerCards = (type: 'SO' | 'JO') => {
    return (
      <div className="flex flex-wrap gap-3 lg:justify-content-start">
        {filteredCustomers.map((customer) => {
          const customerPayments = getCustomerPayments(customer.id, type);
          const totalPending = getTotalPending(customer.id, type);
          const overdueCount = getOverdueCount(customer.id, type);

          if (customerPayments.length === 0) return null;

          return (
            <Card
              key={`${customer.id}-${type}`}
              className="flex flex-column w-full sm:w-20rem lg:w-22rem shadow-1 hover:shadow-3 transition-shadow transition-duration-150"
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
                  <span className="text-500">Pending {type === 'SO' ? 'Payments' : 'Receipts'}:</span>
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
                onClick={() => openDetailsDialog(customer)}
                className="w-full p-button-sm"
              />
            </Card>
          );
        })}
        {filteredCustomers.filter(customer => 
          getCustomerPayments(customer.id, type).length === 0
        ).length === filteredCustomers.length && (
          <div className="w-full text-center py-5">
            <i className="pi pi-inbox text-4xl text-400 mb-2" />
            <p className="text-500">No {type === 'SO' ? 'payments' : 'receipts'} found</p>
          </div>
        )}
      </div>
    );
  };

  const openDetailsDialog = async (customer: Customer) => {
    await fetchPaymentModes();
    setSelectedCustomer(customer);
    setDetailsDialogVisible(true);
  };

  const openPaymentDialog = (payment: PendingPayment) => {
    setSelectedPaymentForRecord(payment);
    setPaymentDialogVisible(true);
  };

  const handlePaymentSubmit = () => {
    const paymentData = {
      ...paymentForm,
      type: activeTab === 0 ? 'SO' : 'JO',
      customerId: selectedCustomer?.id,
    };
    
    console.log('Submitting payment:', paymentData);
    
    setPaymentDialogVisible(false);
    setPaymentForm({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      reference: '',
      paymentMethod: null
    });
  };

  return (
    <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0">Pending Transactions</h2>
        <span className="p-input-icon-left w-full md:w-30rem">
          <i className="pi pi-search" />
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or mobile"
            className="w-full"
          />
        </span>
      </div>

      <TabView 
        activeIndex={activeTab} 
        onTabChange={(e) => setActiveTab(e.index)}
        className="custom-tabview"
      >
        <TabPanel 
          header="Payments" 
          headerClassName="w-6"
          contentClassName="pt-3"
        >
          {renderCustomerCards('SO')}
        </TabPanel>
        <TabPanel 
          header="Receipts" 
          headerClassName="w-6"
          contentClassName="pt-3"
        >
          {renderCustomerCards('JO')}
        </TabPanel>
      </TabView>

      <Dialog
        header={selectedCustomer ? `${selectedCustomer.name}'s ${activeTab === 0 ? 'Payment' : 'Receipt'} Details` : 'Details'}
        visible={detailsDialogVisible}
        onHide={() => setDetailsDialogVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
      >
        {selectedCustomer && (
          <>
            <div className="flex justify-content-between align-items-center my-4">
              <div className="font-medium text-xl">{selectedCustomer.name}</div>
              <Tag
                value={`${activeTab === 0 ? 'Payments' : 'Receipts'}: ${formatCurrency(
                  getTotalPending(selectedCustomer.id, activeTab === 0 ? 'SO' : 'JO')
                )}`}
                severity={activeTab === 0 ? 'warning' : 'info'}
              />
            </div>

            <div className="flex flex-column gap-3 mb-4">
              {getCustomerPayments(selectedCustomer.id, activeTab === 0 ? 'SO' : 'JO').length > 0 ? (
                getCustomerPayments(selectedCustomer.id, activeTab === 0 ? 'SO' : 'JO').map((payment) => (
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
                    <div className="flex justify-content-between mb-3">
                      <span className="font-medium">Status:</span>
                      <Tag
                        value={payment.status.toUpperCase()}
                        severity={getSeverity(payment.status)}
                      />
                    </div>
                    <Button
                      label={activeTab === 0 ? 'Receive Payment' : 'Record Payment'}
                      icon="pi pi-money-bill"
                      onClick={() => openPaymentDialog(payment)}
                      className="w-full p-button-sm"
                      severity="success"
                    />
                  </Card>
                ))
              ) : (
                <div className="text-center py-3 text-500">
                  No {activeTab === 0 ? 'payment' : 'receipt'} records found
                </div>
              )}
            </div>
          </>
        )}
      </Dialog>

      <Dialog 
        header={`${activeTab === 0 ? 'Receive' : 'Record'} Payment for ${selectedPaymentForRecord?.orderNumber || ''}`}
        visible={paymentDialogVisible}
        onHide={() => setPaymentDialogVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
      >
        {selectedPaymentForRecord && (
          <div className="p-fluid">
            <div className="my-4 p-3 border-round border-1 surface-border">
              <div className="flex justify-content-between mb-2">
                <span className="font-medium">Customer:</span>
                <span>{selectedCustomer?.name}</span>
              </div>
              <div className="flex justify-content-between">
                <span className="font-medium">Pending Amount:</span>
                <span className="font-bold">{formatCurrency(selectedPaymentForRecord.amount)}</span>
              </div>
            </div>

            <div className="field my-4">
              <label htmlFor="amount" className="font-bold block mb-2">
                Payment Amount (₹)
              </label>
              <InputText 
                id="amount" 
                type="number" 
                className="w-full" 
                placeholder="Enter amount"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="paymentDate" className="font-bold block mb-2">
                Payment Date
              </label>
              <InputText 
                id="paymentDate" 
                type="date" 
                className="w-full" 
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="paymentMethod" className="font-bold block mb-2">
                Payment Method
              </label>
              <Dropdown 
                id="paymentMethod"
                value={paymentForm.paymentMethod}
                options={paymentModes.map(mode => ({
                  label: mode.mode_name,
                  value: mode.id
                }))}
                optionLabel="label"
                placeholder="Select payment method"
                className="w-full"
                onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.value})}
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="reference" className="font-bold block mb-2">
                Reference/Note
              </label>
              <InputText 
                id="reference" 
                className="w-full" 
                placeholder="Enter reference or note"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
              />
            </div>

            <div className="flex justify-content-end gap-2 mt-4">
              <Button 
                label="Cancel" 
                icon="pi pi-times" 
                className="p-button-secondary"
                onClick={() => setPaymentDialogVisible(false)}
              />
              <Button 
                label={activeTab === 0 ? 'Receive Payment' : 'Record Payment'} 
                icon="pi pi-check" 
                className="p-button-success"
                onClick={handlePaymentSubmit}
                disabled={!paymentForm.amount || !paymentForm.paymentDate || !paymentForm.paymentMethod}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default PendingPayments;