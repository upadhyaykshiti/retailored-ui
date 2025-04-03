/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

type Status = 'active' | 'inactive';
type BrandType = 'Job' | 'Vendor' | 'Customer' | 'Self';

interface Brand {
  id: number;
  name: string;
  address: string;
  type: BrandType;
  status: Status;
}

interface Company {
  id: number;
  name: string;
  website: string;
  domain: string;
  status: Status;
  brands: Brand[];
}

interface StatusOption {
  label: string;
  value: Status;
  icon: string;
}

interface BrandTypeOption {
  label: string;
  value: BrandType;
}

const statusOptions: StatusOption[] = [
  { label: 'Active', value: 'active', icon: 'pi pi-check-circle' },
  { label: 'Inactive', value: 'inactive', icon: 'pi pi-times-circle' }
];

const brandTypeOptions: BrandTypeOption[] = [
  { label: 'Job', value: 'Job' },
  { label: 'Vendor', value: 'Vendor' },
  { label: 'Customer', value: 'Customer' },
  { label: 'Self', value: 'Self' }
];

const initialCompanies: Company[] = [
  {
    id: 1,
    name: 'Fashion House Inc',
    website: 'www.fashionhouse.com',
    domain: 'fashionhouse.com',
    status: 'active',
    brands: [
      { id: 1, name: 'Urban Chic', address: '123 Main St', type: 'Self', status: 'active' },
      { id: 2, name: 'Classic Couture', address: '456 Market St', type: 'Customer', status: 'inactive' }
    ]
  },
  {
    id: 2,
    name: 'Textile Empire',
    website: 'www.textileempire.com',
    domain: 'textileempire.com',
    status: 'active',
    brands: [
      { id: 3, name: 'Fabric World', address: '789 Textile Ave', type: 'Vendor', status: 'active' }
    ]
  }
];

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showBrandDialog, setShowBrandDialog] = useState(false);
  const [showBrandsView, setShowBrandsView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentBrand, setCurrentBrand] = useState<Brand>({
    id: 0,
    name: '',
    address: '',
    type: 'Self',
    status: 'active'
  });

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('companies');
    if (saved) {
      setCompanies(JSON.parse(saved));
    } else {
      setCompanies(initialCompanies);
    }
  }, []);

  useEffect(() => {
    if (isClient && companies.length > 0) {
      localStorage.setItem('companies', JSON.stringify(companies));
    }
  }, [companies, isClient]);

  const handleAddCompany = () => {
    setCurrentCompany({
      id: 0,
      name: '',
      website: '',
      domain: '',
      status: 'active',
      brands: []
    });
    setEditMode(false);
    setShowCompanyDialog(true);
  };

  const handleEditCompany = (company: Company) => {
    setCurrentCompany({ ...company });
    setEditMode(true);
    setShowCompanyDialog(true);
  };

  const handleAddBrand = (company: Company) => {
    setCurrentCompany(company);
    setCurrentBrand({
      id: 0,
      name: '',
      address: '',
      type: 'Self',
      status: 'active'
    });
    setShowBrandDialog(true);
  };

  const handleEditBrand = (company: Company, brand: Brand) => {
    setCurrentCompany(company);
    setCurrentBrand({ ...brand });
    setShowBrandDialog(true);
  };

  const handleSaveCompany = () => {
    if (!currentCompany) return;

    let updatedCompanies: Company[];
    
    if (editMode) {
      updatedCompanies = companies.map(c => 
        c.id === currentCompany.id ? currentCompany : c
      );
    } else {
      const newId = companies.length > 0 
        ? Math.max(...companies.map(c => c.id)) + 1 
        : 1;
        
      updatedCompanies = [
        ...companies, 
        {
          ...currentCompany,
          id: newId
        }
      ];
    }
  
    setCompanies(updatedCompanies);
    setShowCompanyDialog(false);
  };

  const handleSaveBrand = () => {
    if (!currentCompany) return;

    const updatedCompanies = [...companies];
    const companyIndex = updatedCompanies.findIndex(c => c.id === currentCompany.id);
    
    if (companyIndex === -1) return;

    if (currentBrand.id === 0) {
      const newId = currentCompany.brands.length > 0 
        ? Math.max(...currentCompany.brands.map(b => b.id)) + 1 
        : 1;
      const newBrand = { ...currentBrand, id: newId };
      updatedCompanies[companyIndex].brands.push(newBrand);
    } else {
      const brandIndex = updatedCompanies[companyIndex].brands.findIndex(b => b.id === currentBrand.id);
      if (brandIndex !== -1) {
        updatedCompanies[companyIndex].brands[brandIndex] = currentBrand;
      }
    }
    
    setCompanies(updatedCompanies);
    setShowBrandDialog(false);
  };

  const confirmStatusChange = (companyId: number, newStatus: Status) => {
    confirmDialog({
      message: `Are you sure you want to mark this company as ${newStatus}?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-info-circle',
      accept: () => {
        setCompanies(companies.map(c => 
          c.id === companyId ? { ...c, status: newStatus } : c
        ));
      }
    });
  };

  const confirmBrandStatusChange = (companyId: number, brandId: number, newStatus: Status) => {
    confirmDialog({
      message: `Are you sure you want to mark this brand as ${newStatus}?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-info-circle',
      accept: () => {
        setCompanies(companies.map(c => {
          if (c.id === companyId) {
            return {
              ...c,
              brands: c.brands.map(b => 
                b.id === brandId ? { ...b, status: newStatus } : b
              )
            };
          }
          return c;
        }));
      }
    });
  };

  const statusItemTemplate = (option: StatusOption) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className={`${option.icon} ${option.value === 'active' ? 'text-green-500' : 'text-red-500'}`}></i>
        <span>{option.label}</span>
      </div>
    );
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <ConfirmDialog />
      
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0">Company Management</h2>
        <Button 
          label="Add Company" 
          icon="pi pi-plus" 
          onClick={handleAddCompany}
          className="w-full md:w-auto"
          size="small"
        />
      </div>

      <div className="grid">
        {companies.map((company) => (
          <div key={company.id} className="col-12 sm:col-6 lg:col-4">
            <Card className="mb-3 transition-all transition-duration-200 hover:shadow-4">
              <div className="flex justify-content-between align-items-start">
                <h3 className="text-xl m-0">{company.name}</h3>
                <Tag 
                  value={company.status === 'active' ? 'Active' : 'Inactive'}
                  severity={company.status === 'active' ? 'success' : 'danger'}
                  className="align-self-start"
                />
              </div>

              <Divider className="my-2" />

              <div className="flex flex-column gap-2">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-globe text-500"></i>
                  <span>{company.website}</span>
                </div>
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-link text-500"></i>
                  <span>{company.domain}</span>
                </div>
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-tags text-500"></i>
                  <span>{company.brands.length} brands</span>
                </div>
              </div>

              <Divider className="my-2" />

              <div className="flex justify-content-between">
                <Button 
                  icon="pi pi-eye" 
                  label="View Brands" 
                  onClick={() => {
                    setCurrentCompany(company);
                    setShowBrandsView(true);
                    setIsMaximized(true);
                  }}
                  className="p-button-text"
                />
                <div className="flex gap-2">
                  <Button 
                    icon="pi pi-plus" 
                    rounded
                    text
                    onClick={() => handleAddBrand(company)}
                    severity="success"
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    rounded
                    text
                    onClick={() => handleEditCompany(company)}
                    severity="secondary"
                  />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Dialog 
        visible={showCompanyDialog} 
        onHide={() => setShowCompanyDialog(false)}
        header={editMode ? "Edit Company" : "Add New Company"}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className="w-full"
        blockScroll
      >
        {currentCompany && (
          <div className="flex flex-column gap-3">
            <div className="field">
              <label>Company Name</label>
              <InputText
                value={currentCompany.name}
                onChange={(e) => setCurrentCompany({...currentCompany, name: e.target.value})}
                className="w-full"
              />
            </div>
            <div className="field">
              <label>Website</label>
              <InputText
                value={currentCompany.website}
                onChange={(e) => setCurrentCompany({...currentCompany, website: e.target.value})}
                className="w-full"
              />
            </div>
            <div className="field">
              <label>Domain</label>
              <InputText
                value={currentCompany.domain}
                onChange={(e) => setCurrentCompany({...currentCompany, domain: e.target.value})}
                className="w-full"
              />
            </div>
            <div className="field">
              <label>Status</label>
              <Dropdown
                value={currentCompany.status}
                options={statusOptions}
                onChange={(e: DropdownChangeEvent) => setCurrentCompany({
                  ...currentCompany,
                  status: e.value
                })}
                optionLabel="label"
                optionValue="value"
                itemTemplate={statusItemTemplate}
                valueTemplate={statusItemTemplate}
                className="w-full"
              />
            </div>
            <div className="flex justify-content-end gap-2 mt-3">
              <Button 
                label="Cancel" 
                icon="pi pi-times" 
                onClick={() => setShowCompanyDialog(false)}
                className="p-button-text"
              />
              <Button 
                label="Save" 
                icon="pi pi-check" 
                onClick={handleSaveCompany}
                disabled={!currentCompany.name}
              />
            </div>
          </div>
        )}
      </Dialog>

      <Dialog 
        visible={showBrandDialog} 
        onHide={() => setShowBrandDialog(false)}
        header={currentBrand.id === 0 ? "Add Brand" : "Edit Brand"}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className="w-full"
        blockScroll
      >
        <div className="flex flex-column gap-3">
          <div className="field">
            <label>Brand Name</label>
            <InputText
              value={currentBrand.name}
              onChange={(e) => setCurrentBrand({...currentBrand, name: e.target.value})}
              className="w-full"
            />
          </div>
          <div className="field">
            <label>Address</label>
            <InputText
              value={currentBrand.address}
              onChange={(e) => setCurrentBrand({...currentBrand, address: e.target.value})}
              className="w-full"
            />
          </div>
          <div className="field">
            <label>Type</label>
            <Dropdown
              value={currentBrand.type}
              options={brandTypeOptions}
              onChange={(e: DropdownChangeEvent) => setCurrentBrand({
                ...currentBrand,
                type: e.value
              })}
              optionLabel="label"
              optionValue="value"
              className="w-full"
            />
          </div>
          <div className="field">
            <label>Status</label>
            <Dropdown
              value={currentBrand.status}
              options={statusOptions}
              onChange={(e: DropdownChangeEvent) => setCurrentBrand({
                ...currentBrand,
                status: e.value
              })}
              optionLabel="label"
              optionValue="value"
              itemTemplate={statusItemTemplate}
              valueTemplate={statusItemTemplate}
              className="w-full"
            />
          </div>
          <div className="flex justify-content-end gap-2 mt-3">
            <Button 
              label="Cancel" 
              icon="pi pi-times" 
              onClick={() => setShowBrandDialog(false)}
              className="p-button-text"
            />
            <Button 
              label="Save" 
              icon="pi pi-check" 
              onClick={handleSaveBrand}
              disabled={!currentBrand.name || !currentBrand.address}
            />
          </div>
        </div>
      </Dialog>

      <Dialog 
        visible={showBrandsView} 
        onHide={() => setShowBrandsView(false)}
        header="Brands"
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className="w-full"
        blockScroll
        >
        {currentCompany && (
            <div className="flex flex-column h-full">
            <div className="flex justify-content-between mb-4">
                <div>
                    <h4 className="m-0">{currentCompany.name}'s Brands</h4>
                    <span className="text-500">{currentCompany.brands.length} brands</span>
                </div>
            </div>

            <div className="grid">
                {currentCompany.brands.map((brand) => (
                <div key={brand.id} className="col-12 sm:col-6 lg:col-4">
                    <Card className="mb-3 h-full">
                        <div className="flex justify-content-between align-items-start">
                            <h4 className="m-0">{brand.name}</h4>
                            <Tag 
                            value={brand.status} 
                            severity={brand.status === 'active' ? 'success' : 'danger'}
                            />
                        </div>
                        
                        <Divider className="my-2" />
                        
                        <div className="flex flex-column gap-2">
                            <div className="flex align-items-center gap-2">
                            <i className="pi pi-map-marker text-500"></i>
                            <span>{brand.address}</span>
                            </div>
                            <div className="flex align-items-center gap-2">
                            <i className="pi pi-tag text-500"></i>
                            <Tag value={brand.type} severity="info" />
                            </div>
                        </div>
                        
                        <div className="flex justify-content-end gap-2">
                            <Button 
                                icon="pi pi-pencil" 
                                rounded 
                                text
                                onClick={() => handleEditBrand(currentCompany, brand)}
                            />
                            <Button 
                                icon={brand.status === 'active' ? 'pi pi-trash' : 'pi pi-replay'} 
                                rounded 
                                text
                                severity={brand.status === 'active' ? 'danger' : 'warning'}
                                onClick={() => confirmBrandStatusChange(currentCompany.id, brand.id, brand.status === 'active' ? 'inactive' : 'active')}
                            />
                        </div>
                    </Card>
                </div>
                ))}
                
                {currentCompany.brands.length === 0 && (
                <div className="col-12 flex justify-content-center align-items-center h-10rem">
                    <div className="text-center">
                    <i className="pi pi-inbox text-4xl text-400 mb-2"></i>
                    <p className="text-600">No brands found for this company</p>
                    <Button 
                        label="Add Brand" 
                        icon="pi pi-plus" 
                        onClick={() => {
                        setShowBrandsView(false);
                        handleAddBrand(currentCompany);
                        }}
                        className="mt-3"
                    />
                    </div>
                </div>
                )}
            </div>
            </div>
        )}
        </Dialog>
    </div>
  );
};

export default Companies;