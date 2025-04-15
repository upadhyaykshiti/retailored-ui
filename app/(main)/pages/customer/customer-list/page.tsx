/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ToggleButton } from 'primereact/togglebutton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { UserService } from '@/demo/service/user.service';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { Calendar } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';
import { Demo } from '@/types';

const CustomerList = () => {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Demo.User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Demo.User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const users = await UserService.getUsers();
        
        const transformedCustomers = users.map((user) => ({
          id: user.id,
          fname: user.fname,
          mobileNumber: user.mobileNumber,
          email: user.email,
          dob: user.dob,
          sex: user.sex,
          status: user.status,
        }));
        
        setCustomers(transformedCustomers);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
        setError('Failed to load customers. Please try again.');
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load customers',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobileNumber.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCardClick = (customerId: string) => {
    router.push(`/pages/customer/customer-details?id=${customerId}`);
  };

  const showAddDialog = () => {
    setCurrentCustomer({
      id: Date.now().toString(),
      fname: '',
      mobileNumber: '',
      email: '',
      dob: '',
      sex: 'M',
      status: 'active'
    });
    setIsEditMode(false);
    setVisible(true);
  };

  const showEditDialog = (customer: Demo.User) => {
    setCurrentCustomer({ ...customer });
    setIsEditMode(true);
    setVisible(true);
  };

  const handleSave = async () => {
    if (!currentCustomer) return;

    try {
      if (isEditMode) {
        const updatedUser = await UserService.updateUser(currentCustomer.id, {
          fname: currentCustomer.fname,
          email: currentCustomer.email || '',
          mobileNumber: currentCustomer.mobileNumber,
          dob: currentCustomer.dob || '',
          sex: currentCustomer.sex,
          status: currentCustomer.status
        });
        
        setCustomers(customers.map(c => c.id === updatedUser.id ? updatedUser : c));
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Customer updated successfully',
          life: 3000
        });
      } else {
        const newCustomer = await UserService.createUser({
          fname: currentCustomer.fname,
          email: currentCustomer.email || '',
          mobileNumber: currentCustomer.mobileNumber,
          dob: currentCustomer.dob || '',
          sex: currentCustomer.sex,
          isCustomer: "Y",
          rlcode: 1,
          cmpcode: 1,
          admsite_code: 1,
          user_type: "1",
          status: "active"
        });
        
        setCustomers([...customers, newCustomer]);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Customer created successfully',
          life: 3000
        });
      }
      setVisible(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save customer',
        life: 3000
      });
    }
  };

  const toggleCustomerStatus = (customerId: string) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId 
        ? { ...customer, status: customer.status === 'active' ? 'inactive' : 'active' } 
        : customer
    ));
  };

  const confirmStatusChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    const isActive = customer?.status === 'active';
    
    confirmDialog({
      message: `Are you sure you want to mark this customer as ${isActive ? 'inactive' : 'active'}?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-info-circle',
      acceptClassName: isActive ? 'p-button-danger' : 'p-button-success',
      accept: () => {
        toggleCustomerStatus(customerId);
        toast.current?.show({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Customer marked as ${isActive ? 'inactive' : 'active'}`,
          life: 3000
        });
      }
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const footerContent = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
      <Button label="Save" icon="pi pi-check" onClick={handleSave} autoFocus />
    </div>
  );
  
  if (loading) {
    return (
      <div className="grid p-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="col-12 md:col-6 lg:col-4 p-3">
            <Card>
              <div className="flex justify-content-between mb-3">
                <Skeleton width="10rem" height="1.5rem" />
                <Skeleton width="4rem" height="1.5rem" />
              </div>
              <div className="flex flex-column gap-2">
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <div className="flex justify-content-end gap-2 mt-3">
                  <Skeleton shape="circle" size="2rem" />
                  <Skeleton shape="circle" size="2rem" />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="p-4 border-round surface-card">
          <div className="flex flex-column align-items-center gap-3">
            <i className="pi pi-exclamation-triangle text-4xl text-red-500" />
            <span className="text-lg">{error}</span>
            <Button 
              label="Retry"
              icon="pi pi-refresh"
              onClick={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Toast ref={toast} />
      
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0">Customers</h2>
        <span className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone or email"
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
                  <h3 className="text-xl m-0">{customer.fname}</h3>
                  <div className="text-sm text-500 flex align-items-center gap-2 mt-2">
                    <i className="pi pi-phone" /> {customer.mobileNumber}
                  </div>
                  {customer.email && (
                    <div className="text-sm text-500 flex align-items-center gap-2 mt-2">
                      <i className="pi pi-envelope" /> {customer.email}
                    </div>
                  )}
                  <div className="text-sm text-500 flex align-items-center gap-2 mt-2">
                    <i className="pi pi-calendar" /> {formatDate(customer.dob)}
                  </div>
                  <div className="text-sm text-500 flex align-items-center gap-2 mt-2">
                    <i className="pi pi-user" /> {customer.sex === 'M' ? 'Male' : 'Female'}
                  </div>
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
            {searchTerm && (
              <Button 
                label="Clear search" 
                className="mt-3" 
                onClick={() => setSearchTerm('')}
                size="small"
              />
            )}
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
              <label htmlFor="fname">Name</label>
              <InputText 
                id="fname" 
                value={currentCustomer.fname} 
                onChange={(e) => setCurrentCustomer({...currentCustomer, fname: e.target.value})}
                required
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <InputText 
                id="mobileNumber" 
                value={currentCustomer.mobileNumber} 
                onChange={(e) => setCurrentCustomer({...currentCustomer, mobileNumber: e.target.value})}
                required
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
            <div className="field col-12 md:col-6">
              <label htmlFor="dob">Date of Birth</label>
              <Calendar
                id="dob"
                value={currentCustomer.dob ? new Date(currentCustomer.dob) : null}
                onChange={(e) => setCurrentCustomer({
                  ...currentCustomer,
                  dob: e.value?.toISOString().split('T')[0] || ''
                })}
                dateFormat="dd/mm/yy"
                showIcon
              />
            </div>
            <div className="field col-12 md:col-6">
              <label>Gender</label>
              <div className="flex align-items-center gap-3 mt-2">
                <div className="flex align-items-center">
                  <RadioButton
                    inputId="male"
                    name="gender"
                    value="M"
                    onChange={(e) => setCurrentCustomer({...currentCustomer, sex: e.value})}
                    checked={currentCustomer.sex === 'M'}
                  />
                  <label htmlFor="male" className="ml-2">Male</label>
                </div>
                <div className="flex align-items-center">
                  <RadioButton
                    inputId="female"
                    name="gender"
                    value="F"
                    onChange={(e) => setCurrentCustomer({...currentCustomer, sex: e.value})}
                    checked={currentCustomer.sex === 'F'}
                  />
                  <label htmlFor="female" className="ml-2">Female</label>
                </div>
              </div>
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