/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { ToggleButton } from 'primereact/togglebutton';
import { useState, useEffect, useRef } from 'react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Skeleton } from 'primereact/skeleton';
import { useDebounce } from 'use-debounce';
import { useInfiniteObserver } from '@/demo/hooks/useInfiniteObserver';
import { VendorService } from '@/demo/service/vendor.service';
import { Toast } from '@capacitor/toast';
import FullPageLoader from '@/demo/components/FullPageLoader';

type VendorStatus = 'Y' | 'N';

interface Vendor {
  code: string;
  sitename: string;
  site_type: string;
  ext: VendorStatus;
  cmpcode?: string;
  contact_person?: string;
  mobileNumber?: string;
  email?: string;
}

const Vendors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [visible, setVisible] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Partial<Vendor>>({
    sitename: '',
    ext: 'N',
    site_type: 'V',
    cmpcode: '2',
    contact_person: '',
    mobileNumber: '',
    email: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [paginatorInfo, setPaginatorInfo] = useState<any>(null);
  const [isMaximized, setIsMaximized] = useState(true);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchVendors = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else if (!searchTerm) {
        setIsInitialLoading(true);
      }

      const { data, paginatorInfo } = await VendorService.getVendors(
        20,
        loadMore ? page + 1 : 1
      );

      setVendors(prev => loadMore ? [...prev, ...data] : data);
      setPaginatorInfo(paginatorInfo);
      setHasMorePages(paginatorInfo.hasMorePages);
      if (loadMore) setPage(prev => prev + 1);
      
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      await Toast.show({
        text: 'Failed to fetch vendors',
        duration: 'short',
        position: 'bottom'
      });
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
      setListLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchVendors();
  }, [debouncedSearchTerm]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchVendors();
    }
  };

  useInfiniteObserver({
    targetRef: observerTarget,
    hasMorePages,
    isLoading: isLoadingMore,
    onIntersect: () => {
      if (hasMorePages) {
        fetchVendors(true);
      }
    },
    deps: [hasMorePages, searchTerm]
  });

  const showAddDialog = () => {
    setCurrentVendor({
      sitename: '',
      ext: 'N',
      site_type: 'V',
      cmpcode: '2',
      contact_person: '',
      mobileNumber: '',
      email: ''
    });
    setIsEditMode(false);
    setVisible(true);
  };

  const showEditDialog = (vendor: Vendor) => {
    setCurrentVendor({ 
      ...vendor,
      contact_person: vendor.contact_person || '',
      mobileNumber: vendor.mobileNumber || '',
      email: vendor.email || '',
    });
    setIsEditMode(true);
    setVisible(true);
  };

   const handleSave = async () => {
    if (!currentVendor.sitename) {
      await Toast.show({
        text: 'Vendor name is required',
        duration: 'short',
        position: 'bottom'
      });
      return;
    }

    setListLoading(true);
    try {
      const payload = {
        sitename: currentVendor.sitename,
        site_type: 'V',
        ext: currentVendor.ext || 'N',
        cmpcode: '2',
        mobileNumber: currentVendor.mobileNumber || '',
        email: currentVendor.email || ''
      };

      if (isEditMode && currentVendor.code) {
        await VendorService.updateVendor(currentVendor.code, payload);
        await Toast.show({
          text: 'Vendor updated successfully',
          duration: 'short',
          position: 'bottom'
        });
      } else {
        await VendorService.createVendor(payload);
        await Toast.show({
          text: 'Vendor created successfully',
          duration: 'short',
          position: 'bottom'
        });
      }

      setVisible(false);
      fetchVendors();
    } catch (err) {
      await Toast.show({
        text: 'Failed to save vendor',
        duration: 'short',
        position: 'bottom'
      });
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const confirmStatusChange = async (vendorCode: string, currentStatus: VendorStatus) => {
    const newStatus = currentStatus === 'N' ? 'Y' : 'N';
    
    confirmDialog({
      message: `Are you sure you want to ${newStatus === 'N' ? 'activate' : 'deactivate'} this vendor?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-info-circle',
      accept: async () => {
        try {
          setListLoading(true);
          await VendorService.updateVendor(vendorCode, { ext: newStatus });
          await Toast.show({
            text: `Vendor ${newStatus === 'N' ? 'activated' : 'deactivated'} successfully`,
            duration: 'short',
            position: 'bottom'
          });
          fetchVendors();
        } catch (err) {
          console.error('Failed to update status:', err);
          await Toast.show({
            text: 'Failed to update vendor status',
            duration: 'short',
            position: 'bottom'
          });
        } finally {
          setListLoading(false);
        }
      },
    });
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3 w-full">
          <Skeleton width="10rem" height="1.5rem" />
          <Skeleton width="100%" height="2rem" className="md:w-20rem" />
          <Skeleton width="100%" height="2rem" />
        </div>
  
        <div className="flex flex-wrap gap-3 justify-content-start">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-column w-full sm:w-20rem lg:w-22rem">
              <div className="flex justify-content-between align-items-start mb-3">
                <div>
                  <Skeleton width="12rem" height="1.75rem" className="mb-1" />
                </div>
                <Skeleton width="5rem" height="1.5rem" borderRadius="1rem" />
              </div>

              <div className="flex flex-column gap-2 mb-3">
                <div className="flex align-items-center gap-2">
                  <Skeleton width="10rem" height="1rem" />
                </div>
                <div className="flex align-items-center gap-2">
                  <Skeleton width="10rem" height="1rem" />
                </div>
                <div className="flex align-items-start gap-2">
                  <Skeleton width="10rem" height="1rem" />
                </div>
              </div>

              <div className="flex justify-content-end gap-1">
                <Skeleton shape="circle" size="2rem" />
                <Skeleton shape="circle" size="2rem" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {listLoading && <FullPageLoader />}
      <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <ConfirmDialog />
        
        <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
          <h2 className="text-2xl m-0">Vendors</h2>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
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

        <div className="flex flex-wrap gap-3 justify-content-start">
          {vendors.length > 0 ? (
            <>
              {vendors.map((vendor) => (
                <Card 
                  key={vendor.code} 
                  className="flex flex-column w-full sm:w-20rem lg:w-22rem transition-all transition-duration-200 hover:shadow-4"
                >
                  <div className="flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 className="text-xl m-0">{vendor.sitename || 'Unnamed Vendor'}</h3>
                      <p className="text-sm text-500 mt-1">{vendor.contact_person || 'Contact Person Unvailable'}</p>
                    </div>
                    <Tag 
                      value={vendor.ext === 'N' ? 'Active' : 'Inactive'}
                      severity={vendor.ext === 'N' ? 'success' : 'danger'}
                      className="align-self-start"
                    />
                  </div>

                  <div className="flex flex-column gap-2 mb-3">
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-phone text-sm" />
                      <span className="text-sm">Mobile: {vendor.mobileNumber || 'Not Available'}</span>
                    </div>
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-envelope text-sm" />
                      <span className="text-sm">Email: {vendor.email || 'Not Available'}</span>
                    </div>
                  </div>

                  <div className="flex justify-content-end gap-1">
                    <Button 
                      icon="pi pi-pencil" 
                      rounded 
                      text 
                      onClick={() => showEditDialog(vendor)}
                      severity="secondary"
                      tooltip="Edit vendor"
                      tooltipOptions={{ position: 'top' }}
                    />
                    <Button 
                      icon={vendor.ext === 'N' ? 'pi pi-trash' : 'pi pi-replay'} 
                      rounded 
                      text 
                      severity={vendor.ext === 'N' ? 'danger' : 'success'}
                      onClick={() => confirmStatusChange(vendor.code, vendor.ext)}
                      tooltip={vendor.ext === 'N' ? 'Deactivate' : 'Activate'}
                      tooltipOptions={{ position: 'top' }}
                    />
                  </div>
                </Card>
              ))}
              <div ref={observerTarget} className="w-full flex justify-content-center p-3">
                {isLoadingMore && (
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-spinner pi-spin" />
                    <span>Loading more vendors...</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full p-4 text-center surface-100 border-round">
              <i className="pi pi-search text-3xl mb-2" />
              <h4>No vendors found</h4>
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
          header={isEditMode ? "Edit Vendor" : "Add New Vendor"} 
          visible={visible}
          onHide={() => setVisible(false)}
          maximized={isMaximized}
          onMaximize={(e) => setIsMaximized(e.maximized)}
          className={isMaximized ? 'maximized-dialog' : ''}
          blockScroll
          footer={
            <div>
              <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
              <Button label="Save" icon="pi pi-check" onClick={handleSave} disabled={!currentVendor.sitename} />
            </div>
          }
        >
          {currentVendor && (
            <div className="p-fluid grid my-3">
              <div className="field col-12">
                <label htmlFor="sitename">Vendor Name</label>
                <InputText 
                  id="sitename" 
                  value={currentVendor.sitename || ''} 
                  onChange={(e) => setCurrentVendor({...currentVendor, sitename: e.target.value})} 
                  required
                />
              </div>
              <div className="field col-12">
                <label htmlFor="sitename">Contact Person</label>
                <InputText 
                  id="contact_person" 
                  value={currentVendor.contact_person || ''} 
                  onChange={(e) => setCurrentVendor({...currentVendor, contact_person: e.target.value})} 
                  required
                />
              </div>
              <div className="field col-12">
                <label htmlFor="mobile">Mobile</label>
                <InputText 
                  id="mobile" 
                  value={currentVendor.mobileNumber || ''} 
                  onChange={(e) => setCurrentVendor({...currentVendor, mobileNumber: e.target.value})}
                />
              </div>
              <div className="field col-12">
                <label htmlFor="email">Email</label>
                <InputText 
                  id="email" 
                  value={currentVendor.email || ''} 
                  onChange={(e) => setCurrentVendor({...currentVendor, email: e.target.value})}
                />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="status">Status</label>
                <ToggleButton
                  id="status"
                  onLabel="Active"
                  offLabel="Inactive"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  checked={currentVendor.ext === 'N'}
                  onChange={(e) => setCurrentVendor({
                    ...currentVendor, 
                    ext: e.value ? 'N' : 'Y'
                  })}
                  className="w-full md:w-10rem"
                />
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </>
  );
};

export default Vendors;