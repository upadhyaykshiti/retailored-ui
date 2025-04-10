/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ToggleButton } from 'primereact/togglebutton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

type CustomerStatus = 'active' | 'inactive';

interface Customer {
  id: number;
  name: string;
  mobile: string;
  status: CustomerStatus;
  email?: string;
  address?: string;
}

const CustomerList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([
    { 
      id: 1, 
      name: 'Nishant Kumar', 
      mobile: '+91 1234567890', 
      email: 'nishant@example.com',
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Rahul Sharma', 
      mobile: '+91 9876543210', 
      email: 'rahul@example.com',
      status: 'active' 
    },
    { 
      id: 3, 
      name: 'Priya Patel', 
      mobile: '+91 8765432109', 
      email: 'priya@example.com',
      status: 'inactive' 
    }
  ]);

  const [visible, setVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);


  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile.includes(searchTerm)
  );

  const handleCardClick = (customerId: number) => {
    router.push(`/pages/customer/customer-details?id=${customerId}`);
  };

  const showAddDialog = () => {
    setCurrentCustomer({
      id: customers.length + 1,
      name: '',
      mobile: '',
      status: 'active'
    });
    setIsEditMode(false);
    setVisible(true);
  };

  const showEditDialog = (customer: Customer) => {
    setCurrentCustomer({ ...customer });
    setIsEditMode(true);
    setVisible(true);
  };

  const handleSave = () => {
    if (!currentCustomer) return;

    if (isEditMode) {
      setCustomers(customers.map(c => c.id === currentCustomer.id ? currentCustomer : c));
    } else {
      setCustomers([...customers, currentCustomer]);
    }
    setVisible(false);
  };

  const toggleCustomerStatus = (customerId: number) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId 
        ? { ...customer, status: customer.status === 'active' ? 'inactive' : 'active' } 
        : customer
    ));
  };

  const confirmStatusChange = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    const isActive = customer?.status === 'active';
    
    confirmDialog({
      message: `Are you sure you want to mark this customer as ${isActive ? 'inactive' : 'active'}?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-info-circle',
      acceptClassName: isActive ? 'p-button-danger' : 'p-button-success',
      accept: () => toggleCustomerStatus(customerId)
    });
  };

  const footerContent = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
      <Button label="Save" icon="pi pi-check" onClick={handleSave} autoFocus />
    </div>
  );

  return (
    <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0">Customers</h2>
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
          label="Add Customer" 
          icon="pi pi-plus" 
          onClick={showAddDialog}
          className="w-full md:w-auto"
          size="small"
        />
      </div>

      <div className="flex flex-wrap gap-3 lg:justify-content-start">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <Card 
              key={customer.id} 
              className="flex flex-column w-full sm:w-20rem lg:w-22rem transition-all transition-duration-200 hover:shadow-4 cursor-pointer"
              onClick={() => handleCardClick(customer.id)}
            >
              <div className="flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="text-xl m-0">{customer.name}</h3>
                  <div className="text-sm text-500 flex align-items-center gap-2 mt-2">
                    <i className="pi pi-phone" /> {customer.mobile}
                  </div>
                  {customer.email && (
                    <div className="text-sm text-500 flex align-items-center gap-2 mt-2">
                      <i className="pi pi-envelope" /> {customer.email}
                    </div>
                  )}
                </div>
                <Tag 
                  value={customer.status === 'active' ? 'Active' : 'Inactive'}
                  severity={customer.status === 'active' ? 'success' : 'danger'}
                  className="align-self-start"
                />
              </div>

              <div className="flex justify-content-end gap-1">
                <Button 
                  icon="pi pi-pencil" 
                  rounded 
                  text 
                  onClick={(e) => {
                    e.stopPropagation();
                    showEditDialog(customer);
                  }}
                  severity="secondary"
                />
                <Button 
                  icon={customer.status === 'active' ? 'pi pi-trash' : 'pi pi-replay'} 
                  rounded 
                  text 
                  severity={customer.status === 'active' ? 'danger' : 'success'}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmStatusChange(customer.id);
                  }}
                />
              </div>
            </Card>
          ))
        ) : (
          <div className="w-full p-4 text-center surface-100 border-round">
            <i className="pi pi-search text-4xl mb-2" />
            <h3>No customers found</h3>
          </div>
        )}
      </div>

      <Dialog 
        header={isEditMode ? "Edit Customer" : "Add New Customer"} 
        visible={visible} 
        onHide={() => setVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className="w-full"
        blockScroll
        footer={footerContent}
      >
        {currentCustomer && (
          <div className="p-fluid grid">
            <div className="field col-12 md:col-6">
              <label htmlFor="name">Name</label>
              <InputText 
                id="name" 
                value={currentCustomer.name} 
                onChange={(e) => setCurrentCustomer({...currentCustomer, name: e.target.value})} 
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="mobile">Mobile</label>
              <InputText 
                id="mobile" 
                value={currentCustomer.mobile} 
                onChange={(e) => setCurrentCustomer({...currentCustomer, mobile: e.target.value})} 
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="email">Email</label>
              <InputText 
                id="email" 
                value={currentCustomer.email || ''} 
                onChange={(e) => setCurrentCustomer({...currentCustomer, email: e.target.value})} 
              />
            </div>
            <div className="field col-12">
              <label htmlFor="status">Status</label>
              <ToggleButton
                id="status"
                onLabel="Active"
                offLabel="Inactive"
                onIcon="pi pi-check"
                offIcon="pi pi-times"
                checked={currentCustomer.status === 'active'}
                onChange={(e) => setCurrentCustomer({
                  ...currentCustomer, 
                  status: e.value ? 'active' : 'inactive'
                })}
                className="w-full md:w-10rem"
              />
            </div>
          </div>
        )}
      </Dialog>
      <ConfirmDialog />
    </div>
  );
};

export default CustomerList;