/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type CustomerStatus = 'active' | 'inactive';

interface Customer {
  id: number;
  name: string;
  mobile: string;
  status: CustomerStatus;
}

const CustomerList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, name: 'Nishant kumar', mobile: '+91 1234567890', status: 'active' },
  ]);

  const handleCardClick = (customerId: number) => {
    router.push(`/pages/customer/customer-details`);
  };

  const handleAddCustomer = () => {
  };

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
          onClick={handleAddCustomer}
          className="w-full md:w-auto"
          size="small"
        />
      </div>

      <div className="flex flex-wrap gap-3 lg:justify-content-start">
        {customers.map((customer) => (
          <Card 
            key={customer.id} 
            className="flex flex-column w-full sm:w-20rem lg:w-22rem transition-all transition-duration-200 hover:shadow-4 cursor-pointer"
            onClick={() => handleCardClick(customer.id)}
          >
            <div className="flex justify-content-between align-items-start">
              <div>
                <h3 className="text-xl m-0">{customer.name}</h3>
                <p className="text-sm text-500 mt-1">{customer.mobile}</p>
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
                }}
                severity="secondary"
              />
              <Button 
                icon="pi pi-trash" 
                rounded 
                text 
                severity="danger"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;