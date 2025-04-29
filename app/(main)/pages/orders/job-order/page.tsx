/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { useState, useEffect, useRef, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Sidebar } from 'primereact/sidebar';
import { JobOrderService } from '@/demo/service/job-order.service';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDebounce } from 'use-debounce';

interface JobOrderMain {
  id: string;
  job_date: string;
  status_id: string;
  docno: string | null;
  ord_qty: number;
  delivered_qty: number;
  cancelled_qty: number;
  desc1: string | null;
  status: {
    id: string;
    status_name: string;
  };
}
interface SalesOrder {
  id: number;
  orderId: string;
  customerName: string;
  items: OrderItem[];
  date: Date;
}

interface OrderItem {
  id: number;
  name: string;
  selected: boolean;
}

const JobOrder = () => {
  const [jobOrders, setJobOrders] = useState<JobOrderMain[]>([]);
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrderMain | null>(null);
  const [isMaximized, setIsMaximized] = useState(true);
  const [visible, setVisible] = useState(false);
  const [createOrderVisible, setCreateOrderVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [jobbers, setJobbers] = useState<any[]>([]);
  const [selectedJobber, setSelectedJobber] = useState<any>(null);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [orderSidebarVisible, setOrderSidebarVisible] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [loadingJobbers, setLoadingJobbers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    hasMorePages: false,
    lastPage: 1,
    perPage: 10,
    total: 0
  });
  const toast = useRef<Toast>(null);
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const initializeSalesOrders = () => {
    const orders: SalesOrder[] = [
      { 
        id: 1, 
        orderId: 'ORD-2023-05-16-1430', 
        customerName: 'Nishant Kumar', 
        items: [
          { id: 101, name: 'Formal Shirt', selected: false },
          { id: 102, name: 'Designer Kurta', selected: false }
        ],
        date: new Date('2023-05-16')
      },
      { 
        id: 2, 
        orderId: 'ORD-2023-05-18-1100', 
        customerName: 'Rahul Sharma', 
        items: [
          { id: 201, name: 'Silk Kurta', selected: false },
          { id: 202, name: 'Cotton Pants', selected: false }
        ],
        date: new Date('2023-05-18')
      },
      { 
        id: 3, 
        orderId: 'ORD-2023-05-20-1600', 
        customerName: 'Priya Singh', 
        items: [
          { id: 301, name: 'Designer Saree', selected: false },
          { id: 302, name: 'Blouse', selected: false }
        ],
        date: new Date('2023-05-20')
      },
    ];
    setSalesOrders(orders);
  };

  const fetchJobOrders = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const { data, pagination: paginationData } = await JobOrderService.getJobOrderMains(
        page,
        10,
        search || null
      );

      setJobOrders(prev => page === 1 ? data : [...prev, ...data]);
      setPagination({
        currentPage: paginationData.currentPage,
        hasMorePages: paginationData.hasMorePages,
        lastPage: paginationData.lastPage,
        perPage: paginationData.perPage,
        total: paginationData.total
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch job orders',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobOrders(1, searchTerm);
  }, [searchTerm, fetchJobOrders]);

  useEffect(() => {
    setLoadingJobbers(true);
    const fetchJobbers = async () => {
      try {
        const response = await JobOrderService.getJobberList();
        const formattedJobbers = response.map(jobber => ({
          label: jobber.sitename,
          value: jobber.code
        }));
        setJobbers(formattedJobbers);
      } catch (error) {
        console.error('Error fetching jobbers:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch jobbers',
          life: 3000
        });
      } finally {
        setLoadingJobbers(false);
      }
    };

    fetchJobbers();
  }, []);

  useEffect(() => {
    if (loading || !pagination.hasMorePages) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && pagination.hasMorePages) {
        fetchJobOrders(pagination.currentPage + 1, searchTerm);
      }
    };

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(observerCallback);
    if (loadingRef.current) observer.current.observe(loadingRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, pagination, searchTerm, fetchJobOrders]);

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'danger';
      default: return null;
    }
  };

  const openJobOrderDetails = (jobOrder: JobOrderMain) => {
    setSelectedJobOrder(jobOrder);
    setVisible(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const handleItemSelection = (orderId: number, itemId: number) => {
    const updatedOrders = salesOrders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => {
          if (item.id === itemId) {
            return { ...item, selected: !item.selected };
          }
          return item;
        });
        return { ...order, items: updatedItems };
      }
      return order;
    });
    
    setSalesOrders(updatedOrders);
    
    const selected = updatedOrders
      .flatMap(order => order.items)
      .filter(item => item.selected);
    setSelectedItems(selected);
  };

  const handleSelectAllInOrder = (orderId: number, selectAll: boolean) => {
    const updatedOrders = salesOrders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => ({
          ...item,
          selected: selectAll
        }));
        return { ...order, items: updatedItems };
      }
      return order;
    });
    
    setSalesOrders(updatedOrders);
    
    const selected = updatedOrders
      .flatMap(order => order.items)
      .filter(item => item.selected);
    setSelectedItems(selected);
  };

  const handleCreateOrder = () => {
    console.log('Creating order with:', {
      jobber: selectedJobber,
      items: selectedItems
    });
    setCreateOrderVisible(false);
    setSelectedJobber(null);
    setSelectedItems([]);
    initializeSalesOrders();
  };

  const openCreateOrderDialog = async () => {
    try {
      const response = await JobOrderService.getJobberList();
      const formattedJobbers = response.map(jobber => ({
        label: jobber.sitename,
        value: jobber.code,
        ...jobber
      }));
      setJobbers(formattedJobbers);
    } catch (error) {
      console.error('Error fetching jobbers:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch jobbers',
        life: 3000
      });
    }
    
    initializeSalesOrders();
    setCreateOrderVisible(true);
  };

  const filteredOrders = salesOrders.filter(order => 
    order.orderId.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(orderSearchTerm.toLowerCase()))
  );

  return (
    <div className="p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Toast ref={toast} position="top-right" />

      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0 mb-3">Job Orders</h2>
        <span className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchJobOrders(1, e.target.value);
            }}
            placeholder="Search"
            className="w-full"
          />
        </span>
        <Button 
          label="Create Job Order" 
          icon="pi pi-plus" 
          onClick={openCreateOrderDialog}
          className="w-full md:w-auto"
          size="small"
        />
      </div>
    
      <div className="grid">
        {jobOrders.map((jobOrder) => (
          <div key={jobOrder.id} className="col-12 md:col-6 lg:col-4">
            <Card className="h-full">
              <div className="flex flex-column gap-2">
                <div className="flex justify-content-between align-items-center">
                  <span className="font-bold">{jobOrder.docno || `JOB-${jobOrder.id}`}</span>
                  <Tag 
                    value={jobOrder.status.status_name} 
                    severity={getStatusSeverity(jobOrder.status.status_name)} 
                  />
                </div>
                
                <Divider className="my-2" />
                
                <div className="flex flex-column gap-1">
                <div className="flex justify-content-between">
                    <span className="text-600">Jobber:</span>
                    <span>Rajesh Tailor</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-600">Job Date:</span>
                    <span>{formatDate(jobOrder.job_date)}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-600">Trial Date:</span>
                    <span>{formatDate(jobOrder.job_date)}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-600">Total Qty:</span>
                    <span>{jobOrder.ord_qty}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-600">Delivered:</span>
                    <span>{jobOrder.delivered_qty}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-600">Cancelled:</span>
                    <span>{jobOrder.cancelled_qty}</span>
                  </div>
                </div>
                
                <Divider className="my-2" />
                
                <div className="flex flex-column gap-1">
                  <span className="text-600">Notes:</span>
                  <p className="m-0 text-sm">{jobOrder.desc1 || 'No notes'}</p>
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

        {loading && Array.from({ length: 3 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="col-12 md:col-6 lg:col-4">
            <Card className="h-full">
              <Skeleton width="100%" height="2rem" className="mb-2" />
              <Divider className="my-2" />
              <Skeleton width="100%" height="1rem" className="mb-2" />
              <Skeleton width="100%" height="1rem" className="mb-2" />
              <Skeleton width="100%" height="1rem" className="mb-2" />
              <Skeleton width="100%" height="1rem" className="mb-2" />
              <Divider className="my-2" />
              <Skeleton width="100%" height="4rem" className="mb-2" />
              <Skeleton width="100%" height="2.5rem" className="mt-3" />
            </Card>
          </div>
        ))}
      </div>

      {!loading && jobOrders.length === 0 && (
        <div className="w-full p-4 text-center surface-100 border-round">
          <i className="pi pi-search text-3xl mb-2" />
          <h4>No job orders found</h4>
          <p>Try adjusting your search or create a new job order</p>
        </div>
      )}

      <div ref={loadingRef} className="flex justify-content-center mt-3">
        {pagination.hasMorePages && !loading && (
          <Button 
            label="Load More" 
            icon="pi pi-arrow-down" 
            onClick={() => fetchJobOrders(pagination.currentPage + 1, searchTerm)}
            className="p-button-text"
          />
        )}
        {loading && pagination.currentPage > 1 && <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" />}
      </div>

      <Sidebar 
        visible={orderSidebarVisible} 
        onHide={() => setOrderSidebarVisible(false)}
        position="bottom"
        style={{ 
          width: '100%',
          height: 'auto',
          maxHeight: '80vh',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
        }}
        className="custom-selector-sidebar"
        header={
          <div className="sticky top-0 bg-white z-1 p-2 surface-border flex justify-content-between align-items-center">
              <span className="font-bold text-2xl">Select Orders</span>
          </div>
        }
        blockScroll
      >
        <div className="flex flex-column h-full">
          <div className="p-3 border-bottom-1 surface-border">
              <span className="p-input-icon-left w-full">
                  <i className="pi pi-search" />
                  <InputText
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      placeholder="Search"
                      className="w-full"
                  />
              </span>
          </div>
          
          <ScrollPanel style={{ height: 'calc(74vh - 166px)' }}>
            {filteredOrders.map((order) => (
              <div key={order.id} className="mb-3 p-3 border-round surface-card">
                <div className="flex align-items-center justify-content-between mb-2">
                  <div>
                    <span className="font-bold">{order.orderId}</span>
                    <span className="ml-2 text-sm">({order.customerName})</span>
                  </div>
                  <div className="flex align-items-center">
                    <Checkbox 
                      inputId={`select-all-${order.id}`}
                      checked={order.items.every(item => item.selected)}
                      onChange={(e) => handleSelectAllInOrder(order.id, e.checked ?? false)}
                    />
                  </div>
                </div>
                
                <div className="grid">
                  {order.items.map((item) => (
                    <div key={item.id} className="col-12 md:col-6">
                      <div className="flex align-items-center p-2 border-round surface-50">
                        <Checkbox 
                          inputId={`item-${item.id}`}
                          checked={item.selected}
                          onChange={() => handleItemSelection(order.id, item.id)}
                        />
                        <label htmlFor={`item-${item.id}`} className="ml-2">
                          {item.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScrollPanel>
          
          <div className="flex justify-content-between align-items-center mt-auto p-3 border-top-1 surface-border">
            <div>
              <span className="font-bold">Selected Items: </span>
              <span>{selectedItems.length}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                label="Cancel" 
                icon="pi pi-times" 
                onClick={() => {
                  setOrderSidebarVisible(false);
                  setSelectedItems([]);
                  initializeSalesOrders();
                }}
                className="p-button-text"
              />
              <Button 
                label="Confirm" 
                icon="pi pi-check" 
                onClick={() => setOrderSidebarVisible(false)}
              />
            </div>
          </div>
        </div>
      </Sidebar>

      <Dialog 
        header="Create New Job Order" 
        visible={createOrderVisible} 
        onHide={() => {
          setCreateOrderVisible(false);
          setSelectedJobber(null);
          setSelectedItems([]);
        }}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
        footer={
          <div className="flex justify-content-end gap-2 w-full p-3 border-top-1 surface-border bg-white">
            <Button 
              label="Cancel" 
              icon="pi pi-times" 
              onClick={() => {
                setCreateOrderVisible(false);
                setSelectedJobber(null);
                setSelectedItems([]);
              }}
              className="p-button-text"
            />
            <Button 
              label="Create Order" 
              icon="pi pi-check" 
              onClick={handleCreateOrder}
              disabled={!selectedJobber || selectedItems.length === 0}
            />
          </div>
        }
      >
        <div className="p-fluid">
          <div className="field my-4">
            <label htmlFor="jobber" className="font-bold block mb-2">
              Select Jobber
            </label>
            <Dropdown 
              id="jobber"
              value={selectedJobber}
              options={jobbers}
              onChange={(e) => setSelectedJobber(e.value)}
              optionLabel="label"
              placeholder={loadingJobbers ? "Loading jobbers..." : "Select a jobber"}
              className="w-full"
              filter
              filterBy="label"
              disabled={loadingJobbers}
            />
          </div>

          <div className="field mb-4">
            <label className="font-bold block mb-2">
              Select Orders
            </label>
            <Button 
              label="Select Orders" 
              icon="pi pi-list" 
              onClick={() => setOrderSidebarVisible(true)}
              className="w-full p-button-outlined"
            />
          </div>

          {selectedItems.length > 0 && (
            <div className="mb-4">
              <h5>Selected Items ({selectedItems.length})</h5>
              <div className="flex flex-wrap gap-2">
                {selectedItems.map(item => (
                  <Tag 
                    key={item.id} 
                    value={item.name} 
                    className="mr-2 mb-2" 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Dialog>

      <Dialog 
        header={`Order Details - ${selectedJobOrder?.docno || `JOB-${selectedJobOrder?.id}`}`} 
        visible={visible} 
        onHide={() => setVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
      >
        {selectedJobOrder && (
          <div className="p-fluid">
            <div className="grid">
              <div className="col-6">
                <div className="field">
                  <label>Job Order Number</label>
                  <p className="m-0 font-medium">{selectedJobOrder.docno || `JOB-${selectedJobOrder.id}`}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Order Date</label>
                  <p className="m-0 font-medium">{formatDate(selectedJobOrder.job_date)}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Status</label>
                  <Tag 
                    value={selectedJobOrder.status.status_name} 
                    severity={getStatusSeverity(selectedJobOrder.status.status_name)} 
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Trial Date</label>
                  <p className="m-0 font-medium">{formatDate(selectedJobOrder.job_date)}</p>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <h5 className="m-0 mb-3">Job Items</h5>
            
            {/* {selectedJobOrderDetails.items.map((item) => (
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
            ))} */}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default JobOrder;