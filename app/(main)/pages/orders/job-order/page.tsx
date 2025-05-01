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

interface MeasurementDetail {
  measurement_master_id: string;
  measurement_val: string;
  measurementMaster: {
    id: string;
    measurement_name: string;
  };
}

interface JobOrderDetail {
  image_url: string | null;
  trial_date: string | null;
  delivery_date: string | null;
  item_cost: number;
  item_discount: number;
  ord_qty: number;
  delivered_qty: number;
  cancelled_qty: number;
  desc1: string | null;
  orderDetail: {
    material: {
      name: string;
      id: string;
    };
    measurementMain: {
      id: string;
      docno: string;
      user: {
        fname: string;
      };
      measurementDetails: MeasurementDetail[];
    };
  };
}
interface OrdersList {
  id: string;
  order_id: string;
  measurement_main_id: string;
  orderMain: {
    docno: string;
    user: {
      id: string;
      fname: string;
    };
    orderDetails: {
      id: string;
      ord_qty: number;
      material: {
        id: string;
        name: string;
      };
    }[];
  };
}

interface OrderItem {
  id: string;
  materialId: string;
  measurementMainID: string;
  name: string;
  selected: boolean;
  quantity: number;
  maxQuantity: number;
  orderId?: string;
  customerName?: string;
  orderUniqueId?: string;
}

interface OrderItemDetails {
  quantity: number;
  makingCharge: number;
  image: File | null;
}

const JobOrder = () => {
  const [jobOrders, setJobOrders] = useState<JobOrderMain[]>([]);
  const [jobOrderDetails, setJobOrderDetails] = useState<JobOrderDetail[]>([]);
  const [measurementDialogVisible, setMeasurementDialogVisible] = useState(false);
  const [selectedMeasurements, setSelectedMeasurements] = useState<MeasurementDetail[]>([]);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [itemDetails, setItemDetails] = useState<{[key: string]: OrderItemDetails}>({});
  const [selectedJobOrderForPayment, setSelectedJobOrderForPayment] = useState<JobOrderMain | null>(null);
  const [itemManagementSidebarVisible, setItemManagementSidebarVisible] = useState(false);
  const [currentlyEditingItem, setCurrentlyEditingItem] = useState<OrderItem | null>(null);
  const [makingCharges, setMakingCharges] = useState<{[key: string]: number}>({});
  const [uploadingImages, setUploadingImages] = useState<{[key: string]: File | null}>({});
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [selectedMaterialName, setSelectedMaterialName] = useState('');
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrderMain | null>(null);
  const [paymentModes, setPaymentModes] = useState<{id: string, mode_name: string}[]>([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(true);
  const [visible, setVisible] = useState(false);
  const [createOrderVisible, setCreateOrderVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [jobbers, setJobbers] = useState<any[]>([]);
  const [selectedJobber, setSelectedJobber] = useState<any>(null);
  const [ordersList, setOrdersList] = useState<OrdersList[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSidebarVisible, setOrderSidebarVisible] = useState(false);
  const [loadingOrdersButton, setLoadingOrdersButton] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [loadingJobbers, setLoadingJobbers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    hasMorePages: false,
    lastPage: 1,
    perPage: 10,
    total: 0
  });
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    hasMorePages: false,
    lastPage: 1,
    perPage: 10,
    total: 0
  });
  const toast = useRef<Toast>(null);
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

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

  const fetchJobOrderDetails = async (jobOrderId: string) => {
    try {
      const response = await JobOrderService.getJobOrdersDetails(jobOrderId);
      setJobOrderDetails(response.jobOrderDetails);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch job order details',
        life: 3000
      });
    }
  };

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
        console.log(formattedJobbers);
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

  const fetchOrdersList = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoadingOrders(true);
      const { data, pagination } = await JobOrderService.getOrdersList(
        page,
        10,
        search || null
      );
  
      setOrdersList(prev => page === 1 ? data : [...prev, ...data]);
      setOrdersPagination({
        currentPage: pagination.currentPage,
        hasMorePages: pagination.hasMorePages,
        lastPage: pagination.lastPage,
        perPage: pagination.perPage,
        total: pagination.total
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch orders',
        life: 3000
      });
    } finally {
      setLoadingOrders(false);
    }
  }, []);

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
      case 'Unknown': return 'info';
      default: return null;
    }
  };

  const openJobOrderDetails = async (jobOrder: JobOrderMain) => {
    setSelectedJobOrder(jobOrder);
    await fetchJobOrderDetails(jobOrder.id);
    setVisible(true);
  };

  const showMeasurements = (measurements: MeasurementDetail[], materialName: string) => {
    setSelectedMeasurements(measurements);
    setSelectedMaterialName(materialName);
    setMeasurementDialogVisible(true);
  };

  const openItemManagement = (item: OrderItem) => {
    setCurrentlyEditingItem(item);
    setItemManagementSidebarVisible(true);
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    if (!currentlyEditingItem) return;
    
    const maxQty = selectedItems.find(item => item.id === currentlyEditingItem.id)?.maxQuantity || Infinity;
    const clampedQty = Math.min(Math.max(1, newQuantity), maxQty);
    
    setItemDetails(prev => ({
      ...prev,
      [currentlyEditingItem.id]: {
        ...prev[currentlyEditingItem.id],
        quantity: clampedQty
      }
    }));
  };
  
  const handleMakingChargeChange = (value: number) => {
    if (!currentlyEditingItem) return;
    setItemDetails(prev => ({
      ...prev,
      [currentlyEditingItem.id]: {
        ...(prev[currentlyEditingItem.id] || {quantity: 1, image: null}),
        makingCharge: value
      }
    }));
  };
  
  const handleItemImageUpload = (file: File | null) => {
    if (!currentlyEditingItem) return;
    setItemDetails(prev => ({
      ...prev,
      [currentlyEditingItem.id]: {
        ...(prev[currentlyEditingItem.id] || {quantity: 1, makingCharge: 0}),
        image: file
      }
    }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const handleItemSelection = (order: OrdersList, material: { id: string; name: string }, ord_qty: number) => {
    setSelectedItems(prev => {
      const itemKey = `${order.id}-${material.id}`;
      const existingIndex = prev.findIndex(item => item.id === itemKey);
      
      if (existingIndex >= 0) {
        return prev.filter(item => item.id !== itemKey);
      } else {
        return [...prev, {
          id: itemKey,
          materialId: material.id,
          measurementMainID: order.measurement_main_id,
          name: material.name,
          selected: true,
          quantity: 1,
          maxQuantity: ord_qty,
          orderId: order.orderMain.docno,
          customerName: order.orderMain.user.fname,
          orderUniqueId: order.id
        }];
      }
    });
  };
  
  const handleSelectAllInOrder = (order: OrdersList, selectAll: boolean) => {
    setSelectedItems(prev => {
      const orderItems = order.orderMain.orderDetails.map(item => ({
        id: `${order.id}-${item.material.id}`,
        materialId: item.material.id,
        measurementMainID: order.measurement_main_id,
        name: item.material.name,
        selected: true,
        quantity: 1,
        maxQuantity: item.ord_qty,
        orderId: order.orderMain.docno,
        customerName: order.orderMain.user.fname,
        orderUniqueId: order.id
      }));
  
      if (selectAll) {
        const newItems = orderItems.filter(item => 
          !prev.some(selected => selected.id === item.id)
        );
        return [...prev, ...newItems];
      } else {
        return prev.filter(item => 
          !orderItems.some(orderItem => orderItem.id === item.id)
        );
      }
    });
  };

  const handleCreateOrder = async () => {
    if (!selectedJobber || selectedItems.length === 0) return;
  
    setCreatingOrder(true);
    try {
      const now = new Date();
      const docno = `JOB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  
      const jobDetails = selectedItems.map(item => ({
        admsite_code: selectedJobber.value,
        order_details_id: item.orderUniqueId || null,
        material_master_id: item.materialId,
        measurement_main_id: item.measurementMainID,
        image_url: itemDetails[item.id]?.image ? URL.createObjectURL(itemDetails[item.id].image!) : null,
        item_cost: itemDetails[item.id]?.makingCharge || 0,
        ord_qty: itemDetails[item.id]?.quantity || 1
      }));
  
      await JobOrderService.createJobOrderwithInput({
        job_date: new Date().toISOString().split('T')[0],
        status_id: null,
        docno: docno,
        job_details: jobDetails
      });
  
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Job order created successfully',
        life: 3000
      });
  
      setCreateOrderVisible(false);
      setSelectedJobber(null);
      setSelectedItems([]);
      setItemDetails({});
      
      fetchJobOrders(1, searchTerm);
    } catch (error) {
      console.error('Error creating job order:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create job order',
        life: 3000
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleSelectOrdersClick = async () => {
    try {
      setLoadingOrdersButton(true);
      await fetchOrdersList(1);
      setOrderSidebarVisible(true);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load orders',
        life: 3000
      });
    } finally {
      setLoadingOrdersButton(false);
    }
  };

  const openCreateOrderDialog = async () => {
    try {
      const jobbersResponse = await JobOrderService.getJobberList();
      const formattedJobbers = jobbersResponse.map(jobber => ({
        label: jobber.sitename,
        value: jobber.code,
        ...jobber
      }));
      setJobbers(formattedJobbers);      
      setCreateOrderVisible(true);
    } catch (error) {
      console.error('Error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to initialize order creation',
        life: 3000
      });
    }
  };

  const handleJobberPayment = async (jobOrder: JobOrderMain) => {
    setSelectedJobOrderForPayment(jobOrder);
    await fetchPaymentModes();
    setPaymentDialogVisible(true);
  };
  
  
  const handlePaymentSubmit = async () => {
    if (!selectedJobOrderForPayment || !paymentForm.amount || !paymentForm.paymentDate || !selectedPaymentMode) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields',
        life: 3000
      });
      return;
    }
  
    try {
      const paymentData = {
        docno: selectedJobOrderForPayment.docno || `JOB-${selectedJobOrderForPayment.id}`,
        payment_date: paymentForm.paymentDate,
        payment_mode: selectedPaymentMode,
        payment_ref: paymentForm.reference || null,
        payment_amt: parseFloat(paymentForm.amount)
      };
  
      await JobOrderService.createPaymentMain(paymentData);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Payment recorded successfully',
        life: 3000
      });
  
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        reference: ''
      });
      setSelectedPaymentMode(null);
      setPaymentDialogVisible(false);
      if (selectedJobOrder) {
        await fetchJobOrderDetails(selectedJobOrder.id);
      }
  
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to record payment',
        life: 3000
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3 w-full">
          <Skeleton width="10rem" height="2rem" />
          <Skeleton width="100%" height="2.5rem" className="md:w-20rem" />
          <Skeleton width="100%" height="2.5rem" />
        </div>
  
        <div className="grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-12 md:col-6 lg:col-4">
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
      </div>
    );
  } 

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
                    value={jobOrder.status?.status_name || "Unknown"} 
                    severity={getStatusSeverity(jobOrder.status?.status_name)} 
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
          <div className="flex justify-content-end gap-2 w-full p-2 border-top-1 surface-border bg-white">
            <Button 
              label="Cancel" 
              icon="pi pi-times" 
              onClick={() => {
                setCreateOrderVisible(false);
                setSelectedJobber(null);
                setSelectedItems([]);
                setUploadingImages({});
              }}
              className="p-button-text"
              disabled={creatingOrder}
            />
            <Button 
              label={creatingOrder ? 'Creating...' : 'Create Order'} 
              icon={creatingOrder ? 'pi pi-spinner pi-spin' : 'pi pi-check'} 
              onClick={handleCreateOrder}
              disabled={!selectedJobber || selectedItems.length === 0 || creatingOrder}
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
              onClick={handleSelectOrdersClick}
              className="w-full p-button-outlined"
              loading={loadingOrdersButton}
              disabled={loadingOrdersButton}
            />
          </div>

          {selectedItems.length > 0 && (
            <div className="mb-4">
              <div className="flex align-items-center mb-3 p-3 bg-primary-100 border-round">
                <i className="pi pi-list-check text-primary-600 mr-2"></i>
                <h5 className="text-lg font-semibold m-0 text-primary-800">
                  Selected Items ({selectedItems.length})
                </h5>
              </div>
              
              <div className="flex flex-column gap-3">
                {selectedItems.map(item => (
                  <div key={item.id} className="p-3 border-round surface-card shadow-2 hover:shadow-3 transition-all transition-duration-200">
                    <div className="flex justify-content-between align-items-start mb-3">
                      <div className="flex align-items-start gap-2 w-full">
                        <div className="bg-primary-100 p-2 border-round">
                          <i className="pi pi-box text-primary-600"></i>
                        </div>
                        
                        <div className="flex-grow-1">
                          <div className="text-lg font-semibold mb-1 text-900 line-clamp-1">
                            {item.name}
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <span className="flex align-items-center gap-1 text-sm bg-gray-100 p-1 px-2 border-round">
                              <i className="pi pi-file-edit text-primary-500"></i>
                              <span className="text-700">{item.orderId}</span>
                            </span>
                            
                            <span className="flex align-items-center gap-1 text-sm bg-gray-100 p-1 px-2 border-round">
                              <i className="pi pi-user text-primary-500"></i>
                              <span className="text-700">{item.customerName}</span>
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          icon="pi pi-pencil" 
                          onClick={() => openItemManagement(item)}
                          className="p-button-rounded p-button-outlined p-button-sm"
                          aria-label="Edit item"
                        />
                      </div>
                    </div>

                    <div className="grid mt-2">
                      <div className="col-6">
                        <div className="text-sm text-600 mb-1">Quantity</div>
                        <div className="font-medium text-900">
                          {itemDetails[item.id]?.quantity || 1}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-sm text-600 mb-1">Making Charges</div>
                        <div className="font-medium text-900">
                          ₹{itemDetails[item.id]?.makingCharge || 0}
                        </div>
                      </div>
                    </div>

                    {itemDetails[item.id]?.image && (
                      <div className="mt-3">
                        <div className="text-sm text-600 mb-1">Image Preview</div>
                        <div className="border-1 border-round surface-border overflow-hidden">
                          <img 
                            src={URL.createObjectURL(itemDetails[item.id].image!)} 
                            alt="Preview" 
                            className="w-full" 
                            style={{ 
                              height: '120px',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Dialog>
      
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
                onChange={(e) => {
                  setOrderSearchTerm(e.target.value);
                  fetchOrdersList(1, e.target.value);
                }}
                placeholder="Search"
                className="w-full"
              />
            </span>
          </div>
          
          <ScrollPanel style={{ height: 'calc(74vh - 166px)' }}>
            {loadingOrders ? (
              <div className="flex justify-content-center p-4">
                <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="4" />
              </div>
            ) : ordersList.length > 0 ? (
              ordersList.map((order) => (
                <div key={order.id} className="mb-3 p-3 border-round surface-card">
                  <div className="flex align-items-center justify-content-between mb-2">
                    <div>
                      <span className="font-bold">{order.orderMain.docno}</span>
                      <span className="ml-2 text-sm">({order.orderMain.user.fname})</span>
                    </div>
                    <div className="flex align-items-center">
                      <Checkbox 
                        inputId={`select-all-${order.id}`}
                        checked={order.orderMain.orderDetails.every(item => 
                          selectedItems.some(selected => selected.id === `${order.id}-${item.material.id}`)
                        )}
                        onChange={(e) => handleSelectAllInOrder(order, e.checked ?? false)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid">
                    {order.orderMain.orderDetails.map((item) => (
                      <div key={`${order.id}-${item.material.id}`} className="col-12 md:col-6">
                        <div className="flex align-items-center justify-content-between p-2 border-round surface-50">
                          <div className="flex align-items-center p-2">
                            <Checkbox 
                              inputId={`item-${order.id}-${item.material.id}`}
                              checked={selectedItems.some(selected => selected.id === `${order.id}-${item.material.id}`)}
                              onChange={() => handleItemSelection(order, item.material, item.ord_qty)}
                            />
                            <label htmlFor={`item-${order.id}-${item.material.id}`} className="ml-2">
                              {item.material.name}
                            </label>
                          </div>
                          
                          {selectedItems.some(selected => selected.id === `${order.id}-${item.material.id}`) && (
                            <Button 
                              icon="pi pi-plus" 
                              onClick={() => openItemManagement({
                                id: `${order.id}-${item.material.id}`,
                                materialId: item.material.id,
                                measurementMainID: order.measurement_main_id,
                                name: item.material.name,
                                selected: true,
                                quantity: 1,
                                maxQuantity: item.ord_qty,
                                orderId: order.orderMain.docno,
                                customerName: order.orderMain.user.fname,
                                orderUniqueId: order.id
                              })}
                              className="p-button-rounded p-button-text p-button-sm"
                              aria-label="Add item"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full p-4 text-center surface-100 border-round">
                <i className="pi pi-search text-3xl mb-2" />
                <h4>No orders found</h4>
              </div>
            )}
          </ScrollPanel>
          
          <div className="flex justify-content-between align-items-center p-3 border-top-1 surface-border sticky bottom-0 bg-white">
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

      <Sidebar 
        visible={itemManagementSidebarVisible}
        onHide={() => setItemManagementSidebarVisible(false)}
        position="bottom"
        style={{ 
          width: '100%',
          height: 'auto',
          maxHeight: '80vh',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
        }}
        className="custom-item-management-sidebar"
        header={
          <div className="sticky top-0 bg-white z-1 p-3 surface-border flex justify-content-between align-items-center">
            <span className="font-bold text-xl">
              {currentlyEditingItem?.name || 'Item Details'}
            </span>
          </div>
        }
        blockScroll
      >
        {currentlyEditingItem && (
          <div className="p-3">
            <div className="field mb-4">
              <label className="font-bold block mb-2 flex align-items-center">
                <i className="pi pi-sort-amount-up mr-2"></i>
                Quantity
              </label>
              <div className="flex align-items-center justify-content-between bg-gray-100 p-2 border-round">
                <Button
                  icon="pi pi-minus" 
                  onClick={() => handleQuantityChange(Math.max(1, (itemDetails[currentlyEditingItem.id]?.quantity || 1) - 1))}
                  className="p-button-rounded p-button-text"
                  disabled={(itemDetails[currentlyEditingItem.id]?.quantity || 1) <= 1}
                />
                <InputText 
                  value={String(itemDetails[currentlyEditingItem.id]?.quantity || 1)}
                  onChange={(e) => {
                    const newValue = Math.max(1, parseInt(e.target.value) || 1);
                    const maxQty = selectedItems.find(item => item.id === currentlyEditingItem.id)?.maxQuantity || Infinity;
                    handleQuantityChange(Math.min(newValue, maxQty));
                  }}
                  className="text-center mx-2 bg-white"
                  style={{ width: '60px' }}
                  keyfilter="int"
                />
                <Button 
                  icon="pi pi-plus" 
                  onClick={() => {
                    const currentQty = itemDetails[currentlyEditingItem.id]?.quantity || 1;
                    const maxQty = selectedItems.find(item => item.id === currentlyEditingItem.id)?.maxQuantity || Infinity;
                    handleQuantityChange(Math.min(currentQty + 1, maxQty));
                  }}
                  className="p-button-rounded p-button-text"
                  disabled={(itemDetails[currentlyEditingItem.id]?.quantity || 1) >= 
                            (selectedItems.find(item => item.id === currentlyEditingItem.id)?.maxQuantity || Infinity)}
                />
              </div>
            </div>

            <div className="field mb-4">
              <label className="font-bold block mb-2 flex align-items-center">
                <i className="pi pi-money-bill mr-2"></i>
                Making Charges (₹)
              </label>
              <InputText 
                value={String(itemDetails[currentlyEditingItem.id]?.makingCharge || 0)}
                onChange={(e) => handleMakingChargeChange(parseFloat(e.target.value) || 0)}
                className="w-full"
                keyfilter="money"
              />
            </div>

            <div className="field">
              <label className="font-bold block mb-2 flex align-items-center">
                <i className="pi pi-image mr-2"></i>
                  Image
              </label>
              
              {itemDetails[currentlyEditingItem.id]?.image ? (
                <div className="border-1 surface-border border-round p-3">
                  <div className="flex justify-content-between align-items-center mb-3">
                    <span className="font-medium">Image:</span>
                    <Button 
                      icon="pi pi-trash" 
                      onClick={() => handleItemImageUpload(null)}
                      className="p-button-sm"
                      severity="danger"
                      text
                    />
                  </div>
                  <div className="flex justify-content-center">
                    <img 
                      src={URL.createObjectURL(itemDetails[currentlyEditingItem.id].image!)} 
                      alt="Item preview" 
                      className="border-round w-full max-h-20rem"
                      style={{ 
                        objectFit: 'cover',
                        aspectRatio: '1/1'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-column gap-2">
                  <input
                    id={`item-image-${currentlyEditingItem.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleItemImageUpload(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label 
                    htmlFor={`item-image-${currentlyEditingItem.id}`}
                    className="p-button p-component p-button-outlined w-full flex justify-content-center align-items-center gap-2"
                  >
                    <i className="pi pi-upload"></i>
                    <span>Upload Image</span>
                  </label>
                </div>
              )}
            </div>

            <div className="bg-white pt-3 pb-1 border-top-1 surface-border w-full">
              <Button 
                label="Done"
                icon="pi pi-check" 
                onClick={() => setItemManagementSidebarVisible(false)}
                className="w-full p-button-sm"
              />
            </div>
          </div>
        )}
      </Sidebar>

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
          <div className="p-fluid my-4">
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
                  <label>Status &nbsp;</label>
                  <Tag 
                    value={selectedJobOrder.status?.status_name || "Unknown"}
                    severity={getStatusSeverity(selectedJobOrder.status?.status_name)} 
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

            <h5 className="m-0 mb-3">Job Order Details</h5>

            {jobOrderDetails.map((detail, index) => (
              <div key={index} className="mb-4 surface-50 p-3 border-round">
                <div className="grid">
                  <div className="col-6">
                    <div className="field">
                      <label>Item Name</label>
                      <p className="m-0 font-medium">{detail.orderDetail.material.name}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Sales Order No</label>
                      <p className="m-0 font-medium">{detail.orderDetail.measurementMain.docno}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Customer Name</label>
                      <p className="m-0 font-medium">{detail.orderDetail.measurementMain.user.fname}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Trial Date</label>
                      <p className="m-0 font-medium">{formatDate(detail.trial_date)}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Delivered Qty</label>
                      <p className="m-0 font-medium">{detail.delivered_qty}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Pending Amount</label>
                      <p className="m-0 font-medium">{detail.item_cost}</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="field">
                      <label>Notes</label>
                      <p className="m-0 font-medium">{detail?.desc1 || 'No notes'}</p>
                    </div>
                  </div>
                  
                  {detail.image_url && (
                    <div className="col-12 mt-3">
                      <Button 
                        label="View Image" 
                        icon="pi pi-image" 
                        onClick={() => window.open(detail.image_url || '', '_blank')}
                        className="p-button-outlined"
                      />
                    </div>
                  )}
                  <div className="col-12 mt-2">
                    <Button
                      label="View Measurements" 
                      icon="pi pi-eye" 
                      onClick={() => showMeasurements(
                        detail.orderDetail.measurementMain.measurementDetails,
                        detail.orderDetail.material.name
                      )}
                      className="p-button-outlined"
                    />
                  </div>
                  <div className="col-12 mt-2">
                    <Button 
                        label="Record Payment" 
                        icon="pi pi-money-bill" 
                        onClick={() => handleJobberPayment(selectedJobOrder!)}
                        className="p-button-success"
                      />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>

      <Dialog 
        header={`Measurement Details for ${selectedMaterialName}`} 
        visible={measurementDialogVisible} 
        onHide={() => {
          setMeasurementDialogVisible(false);
          setSelectedMeasurements([]);
        }}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
      >
        <div className="p-fluid">
          <div className="grid my-2">
            <div className="col-6 font-bold text-600">Customer Name:</div>
            <div className="col-6 font-medium text-right">
              {selectedMeasurements.length > 0 ? 
                jobOrderDetails.find(d => 
                  d.orderDetail.measurementMain.measurementDetails.some(m => 
                    m.measurement_master_id === selectedMeasurements[0].measurement_master_id
                  )
                )?.orderDetail.measurementMain.user.fname || 'N/A' : 'N/A'}
            </div>
            
            <div className="col-6 font-bold text-600">Item Name:</div>
            <div className="col-6 font-medium text-right">
              {selectedMaterialName}
            </div>
          </div>

          {selectedMeasurements.length > 0 ? (
            <>
              <div className="surface-100 p-3 border-round my-4">
                <h4 className="m-0">Measurements</h4>
              </div>

              <div className="grid mb-4">
                {selectedMeasurements.map((detail, index) => (
                  <div key={index} className="col-12 md:col-6">
                    <div className="flex justify-content-between align-items-center p-3 border-bottom-1 surface-border">
                      <span className="font-medium">{detail.measurementMaster.measurement_name}</span>
                      <span className="font-bold">{detail.measurement_val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="surface-100 p-3 border-round my-4 text-center">
              <i className="pi pi-info-circle text-2xl mb-2" />
              <p className="m-0">No measurement details available</p>
            </div>
          )}

          <div className="surface-50 p-3 border-round">
            <h5 className="mt-0 mb-3">Stitch Options</h5>
            <div className="grid">
              <div className="col-6 font-bold text-600">Collar:</div>
              <div className="col-6 font-medium text-right">
                Classic
              </div>
              
              <div className="col-6 font-bold text-600">Sleeve:</div>
              <div className="col-6 font-medium text-right">
                Full
              </div>
              
              <div className="col-6 font-bold text-600">Cuffs:</div>
              <div className="col-6 font-medium text-right">
                Squared
              </div>
              
              <div className="col-6 font-bold text-600">Pocket Type:</div>
              <div className="col-6 font-medium text-right">
                Classic
              </div>
              
              <div className="col-6 font-bold text-600">Back Style:</div>
              <div className="col-6 font-medium text-right">
                Plain
              </div>
              
              <div className="col-6 font-bold text-600">Button Style:</div>
              <div className="col-6 font-medium text-right">
                Standard
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog 
        header={`Record Payment for ${selectedJobOrderForPayment?.docno || `JOB-${selectedJobOrderForPayment?.id}`}`}
        visible={paymentDialogVisible}
        onHide={() => setPaymentDialogVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
      >
        <div className="p-fluid">
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
              value={selectedPaymentMode}
              options={paymentModes.map(mode => ({
                label: mode.mode_name,
                value: mode.id
              }))}
              optionLabel="label"
              placeholder={paymentModes.length ? "Select payment method" : "Loading payment methods..."}
              className="w-full"
              onChange={(e) => {
                setSelectedPaymentMode(e.value);
                setPaymentForm({...paymentForm, paymentMethod: e.value});
              }}
              disabled={!paymentModes.length}
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
              label="Submit" 
              icon="pi pi-check" 
              className="p-button-success"
              onClick={handlePaymentSubmit}
              disabled={!paymentForm.amount || !paymentForm.paymentDate || !selectedPaymentMode}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default JobOrder;