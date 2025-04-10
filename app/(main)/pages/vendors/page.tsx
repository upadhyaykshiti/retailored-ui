/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { ToggleButton } from 'primereact/togglebutton';
import { Chips } from 'primereact/chips';
import { useState } from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';

type VendorStatus = 'active' | 'inactive';

interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  mobile: string;
  email: string;
  services: string[];
  status: VendorStatus;
}

const Vendors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([
    { 
      id: 1, 
      name: 'Tailor Master', 
      contactPerson: 'Rajesh Kumar', 
      mobile: '+91 9876543210', 
      email: 'tailormaster@example.com',
      services: ['Stitching', 'Alterations'],
      status: 'active',
    },
    { 
      id: 2, 
      name: 'Fabric House', 
      contactPerson: 'Mohan Singh', 
      mobile: '+91 8765432109', 
      email: 'fabric@example.com',
      services: ['Fabric Supply', 'Material'],
      status: 'active' 
    },
    { 
      id: 3, 
      name: 'Button World', 
      contactPerson: 'Sunil Sharma', 
      mobile: '+91 7654321098', 
      email: 'buttons@example.com',
      services: ['Buttons', 'Accessories'],
      status: 'inactive' 
    },
  ]);

  const [visible, setVisible] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [isMaximized, setIsMaximized] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleCardClick = (vendorId: number) => {
  };

  const showAddDialog = () => {
    setCurrentVendor({
      id: vendors.length + 1,
      name: '',
      contactPerson: '',
      mobile: '',
      email: '',
      services: [],
      status: 'active'
    });
    setIsEditMode(false);
    setVisible(true);
  };

  const showEditDialog = (vendor: Vendor) => {
    setCurrentVendor({ ...vendor });
    setIsEditMode(true);
    setVisible(true);
  };

  const handleSave = () => {
    if (!currentVendor) return;

    if (isEditMode) {
      setVendors(vendors.map(v => v.id === currentVendor.id ? currentVendor : v));
    } else {
      setVendors([...vendors, currentVendor]);
    }
    setVisible(false);
  };

  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.mobile.includes(searchTerm) ||
    vendor.services.some(service => 
      service.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const footerContent = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
      <Button label="Save" icon="pi pi-check" onClick={handleSave} autoFocus />
    </div>
  );

  return (
    <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0">Vendors</h2>
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
          label="Add Vendor" 
          icon="pi pi-plus" 
          onClick={showAddDialog}
          className="w-full md:w-auto"
          size="small"
        />
      </div>

      <div className="flex flex-wrap gap-3 lg:justify-content-start">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <Card 
              key={vendor.id} 
              className="flex flex-column w-full sm:w-20rem lg:w-22rem transition-all transition-duration-200 hover:shadow-4 cursor-pointer"
              onClick={() => handleCardClick(vendor.id)}
            >
              <div className="flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="text-xl m-0">{vendor.name}</h3>
                  <p className="text-sm text-500 mt-1">{vendor.contactPerson}</p>
                </div>
                <Tag 
                  value={vendor.status === 'active' ? 'Active' : 'Inactive'}
                  severity={vendor.status === 'active' ? 'success' : 'danger'}
                  className="align-self-start"
                />
              </div>

              <div className="flex flex-column gap-2 mb-3">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-phone text-sm" />
                  <span className="text-sm">{vendor.mobile}</span>
                </div>
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-envelope text-sm" />
                  <span className="text-sm">{vendor.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {vendor.services.map((service, index) => (
                  <Tag 
                    key={index} 
                    value={service} 
                    rounded 
                    className="text-xs"
                  />
                ))}
              </div>

              <div className="flex justify-content-end gap-1">
                <Button 
                  icon="pi pi-pencil" 
                  rounded 
                  text 
                  onClick={(e) => {
                    e.stopPropagation();
                    showEditDialog(vendor);
                  }}
                  severity="secondary"
                  tooltip="Edit vendor"
                  tooltipOptions={{ position: 'top' }}
                />
                <Button 
                  icon={vendor.status === 'active' ? 'pi pi-trash' : 'pi pi-replay'} 
                  rounded 
                  text 
                  severity={vendor.status === 'active' ? 'danger' : 'warning'}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </div>
            </Card>
          ))
        ) : (
          <div className="w-full p-4 text-center surface-100 border-round">
            <i className="pi pi-search text-3xl mb-2" />
            <h4>No vendors found</h4>
          </div>
        )}
      </div>

      <Dialog 
        header={isEditMode ? "Edit Vendor" : "Add New Vendor"} 
        visible={visible} 
        onHide={() => setVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className="w-full"
        blockScroll
        footer={footerContent}
      >
        {currentVendor && (
          <div className="p-fluid grid">
            <div className="field col-12 md:col-6">
              <label htmlFor="name">Vendor Name</label>
              <InputText 
                id="name" 
                value={currentVendor.name} 
                onChange={(e) => setCurrentVendor({...currentVendor, name: e.target.value})} 
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="contact">Contact Person</label>
              <InputText 
                id="contact" 
                value={currentVendor.contactPerson} 
                onChange={(e) => setCurrentVendor({...currentVendor, contactPerson: e.target.value})} 
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="mobile">Mobile</label>
              <InputText 
                id="mobile" 
                value={currentVendor.mobile} 
                onChange={(e) => setCurrentVendor({...currentVendor, mobile: e.target.value})} 
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="email">Email</label>
              <InputText 
                id="email" 
                value={currentVendor.email} 
                onChange={(e) => setCurrentVendor({...currentVendor, email: e.target.value})} 
              />
            </div>
            <div className="field col-12">
              <label htmlFor="services">Services (comma separated)</label>
              <Chips
                id="services"
                value={currentVendor.services}
                onChange={(e) => setCurrentVendor({...currentVendor, services: e.value || []})}
                separator=","
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
                checked={currentVendor.status === 'active'}
                onChange={(e) => setCurrentVendor({
                  ...currentVendor, 
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

export default Vendors;