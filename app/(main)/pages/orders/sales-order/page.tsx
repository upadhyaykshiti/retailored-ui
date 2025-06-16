/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/navigation';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { Skeleton } from 'primereact/skeleton';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Sidebar } from 'primereact/sidebar';
import { Dropdown } from 'primereact/dropdown';
import { useSearchParams } from 'next/navigation';
import { SalesOrderService } from '@/demo/service/sales-order.service';
import { JobOrderService } from '@/demo/service/job-order.service';
import FullPageLoader from '@/demo/components/FullPageLoader';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDebounce } from 'use-debounce';
import { Galleria } from 'primereact/galleria';
import { Toast } from '@capacitor/toast';




interface Order {
  id: string;
  user_id: string;
  docno: string;
  order_date: string;
  customer: string;
  ord_amt: number;
  amt_paid: number;
  amt_due: number;
  ord_qty: number;
  delivered_qty: number;
  cancelled_qty: number;
  tentitive_delivery_date: string;
  delivery_date: string;
  desc1: string | null;
  ext: string;
  user: {
    id: string;
    fname: string;
    admsite_code: number;
  }
  orderStatus: {
    id: string;
    status_name: string;
  } | null;
  orderDetails: {
    id: string;
    order_id: string;
    measurement_main_id: string;
    image_url: string[] | null;
    material_master_id: string;
    trial_date: string | null;
    delivery_date: string | null;
    item_amt: number;
    ord_qty: number;
    delivered_qty: number;
    cancelled_qty: number;
    desc1: string | null;
    ext: string;
    item_ref: string;
    orderStatus: {
      id: string;
      status_name: string;
    } | null;
    material: {
        id: string;
        name: string;
    }
    jobOrderDetails: {
      adminSite?: {
        sitename: string;
      };
    }[];
  }[];
}



interface MeasurementData {
  measurement_date: string;
  measurementDetails: {
    measurement_val: string;
    measurement_main_id: string;
    measurementMaster: {
      id: string;
      measurement_name: string;
      data_type: string;
    };
  }[];
}

const SalesOrder = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isMaximized, setIsMaximized] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editOrderDetailDialogVisible, setEditOrderDetailDialogVisible] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order['orderDetails'][0] | null>(null);
  const [measurementData, setMeasurementData] = useState<MeasurementData | null>(null);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [editMeasurementDialogVisible, setEditMeasurementDialogVisible] = useState(false);
  const [editedMeasurements, setEditedMeasurements] = useState<{id: string, name: string, value: string}[]>([]);
  const [statusSidebarVisible, setStatusSidebarVisible] = useState(false);
  const [measurementDialogVisible, setMeasurementDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Order['orderDetails'][0] | null>(null);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [paymentModes, setPaymentModes] = useState<{id: string, mode_name: string}[]>([]);
  const [paymentHistorySidebarVisible, setPaymentHistorySidebarVisible] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);
  const [itemActionSidebarVisible, setItemActionSidebarVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Order['orderDetails'][0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [confirmDeliveredVisible, setConfirmDeliveredVisible] = useState(false);
  const [confirmCancelledVisible, setConfirmCancelledVisible] = useState(false);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [images, setImages] = useState<{itemImageSrc: string}[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    hasMorePages: true
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: ''
  });
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const source = searchParams.get('source');
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderRef = useRef<HTMLDivElement>(null);

  const availableStatuses = [
    { id: '1', name: 'Pending' },
    { id: '2', name: 'In Progress' },
    { id: '5', name: 'Ready for Trial' },
    { id: '3', name: 'Completed' },
    { id: '4', name: 'Cancelled' }
  ];

  const fetchOrders = useCallback(async (page: number, perPage: number, loadMore = false) => {
    try {
      if (loadMore) {
        setIsFetchingMore(true);
      } else {
        setLoading(true);
      }

      const response = await SalesOrderService.getSalesOrders(page, perPage, debouncedSearchTerm);
      const newOrders = response.data.map((res: any) => ({
        ...res,
        customer: res.user.fname,
        delivery_date: res.tentitive_delivery_date,
        orderDetails: []
      }));

      if (loadMore) {
        setOrders(prev => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
      }

      setPagination({
        currentPage: response.pagination.currentPage,
        perPage: response.pagination.perPage,
        total: response.pagination.total,
        hasMorePages: response.pagination.hasMorePages
      });
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      setError('Failed to fetch orders');
      await Toast.show({
        text: 'Failed to load orders',
        duration: 'short',
        position: 'bottom'
      });
    } finally {
      if (loadMore) {
        setIsFetchingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (!source) {
      fetchOrders(1, pagination.perPage);
    }
  }, [fetchOrders, pagination.perPage, debouncedSearchTerm]);

  useEffect(() => {
    if (id) {
      const openDialog = async () => {
        try {
          await fetchOrderDetails(id);
        } finally {
          setLoading(false);
          setVisible(true);
        }
      };

      openDialog();
    }
  }, [id]);

  useEffect(() => {
    if (!pagination.hasMorePages || loading || isFetchingMore) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        fetchOrders(pagination.currentPage + 1, pagination.perPage, true);
      }
    };

    if (lastOrderRef.current) {
      observer.current = new IntersectionObserver(observerCallback, {
        root: null,
        rootMargin: '20px',
        threshold: 1.0
      });

      observer.current.observe(lastOrderRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [pagination, loading, isFetchingMore, fetchOrders]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
          console.log('Fetching order for ID:', orderId); 

      setListLoading(true);
      const res = await SalesOrderService.getSalesOrderById(orderId);
    
      if (res && res.orderDetails) {
        const detailedOrder: Order = res;
        setSelectedOrder(detailedOrder);
      } else {
        setSelectedOrder(null);
        throw new Error('Order details are missing from the response');
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setError('Failed to fetch order details');
      setSelectedOrder(null);
    } finally {
      setListLoading(false);
    }
  };

  const fetchPaymentHistory = async (orderId: string) => {
    try {
      setLoadingPaymentHistory(true);
      const response = await SalesOrderService.getOrderInfoByOrderId(orderId);
      setPaymentHistory(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      await Toast.show({
        text: 'Failed to load payment history',
        duration: 'short',
        position: 'bottom'
      });
    } finally {
      setLoadingPaymentHistory(false);
    }
  };

  const fetchMeasurements = async (OrderID: number) => {
    setLoadingMeasurements(true);
    try {
      const response = await SalesOrderService.getOrderMeasurements(OrderID);
      
      if (!response) {
        setMeasurementData(null);
        return;
      }

      const measurementData = response?.orderDetail?.measurementMain || null;
      
      setMeasurementData(measurementData);
    } catch (error) {
      setMeasurementData(null);
    } finally {
      setLoadingMeasurements(false);
    }
  };

  const fetchPaymentModes = useCallback(async () => {
    try {
      const modes = await JobOrderService.getPaymentModes();
      setPaymentModes(modes);
    } catch (error) {
      console.error('Error fetching payment modes:', error);
    }
  }, []);

  const getStatusSeverity = (status?: string): 'success' | 'info' | 'warning' | 'danger' | null | undefined => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'danger';
      case 'Partial': return 'warning';
      case 'Unknown': return 'info';
      default: return null;
    }
  };

  const openOrderDetails = (order: Order) => {
    fetchOrderDetails(order.id);
    setVisible(true);
  };

  const handleDialogClose = () => {
    setVisible(false);
    if (source) {
      router.push(`/pages/reports/${source}`);
    }
  };

  const itemTemplate = (item: {itemImageSrc: string}) => {
    return (
      <img 
        src={item.itemImageSrc} 
        alt="Preview" 
        style={{ width: '100%', display: 'block' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
        }}
      />
    );
  };
  
  const thumbnailTemplate = (item: {itemImageSrc: string}) => {
    return (
      <img 
        src={item.itemImageSrc} 
        alt="Thumbnail" 
        style={{ display: 'block', width: '100%' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
        }}
      />
    );
  };
  
  const handleImagePreview = (images: string | string[] | null) => {
    if (!images) return;
    
    const imageArray = Array.isArray(images) ? images : [images];
    const imageUrls = imageArray.map(filename => ({
      itemImageSrc: filename
    }));
        
    setImages(imageUrls);
    setActiveImageIndex(0);
    setImagePreviewVisible(true);
  };

  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleDateString('en-IN') : 'Not scheduled';
  };

  const handleAddOrder = () => {
    router.push('/pages/orders/create-order');
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleEditOrderDetail = (detail: Order['orderDetails'][0]) => {
    setSelectedOrderDetail(detail);
    setEditOrderDetailDialogVisible(true);
  };

  const handleUpdateOrderDetail = async () => {
    if (!selectedOrderDetail || !selectedOrder || !selectedOrderDetail.id) {
      await Toast.show({
        text: 'Invalid order details for update',
        duration: 'short',
        position: 'bottom'
      });
      return;
    }
    
    try {
      setIsSavingDetails(true);

      await SalesOrderService.updateOrderDetails(
        selectedOrderDetail.id,
        {
          order_id: Number(selectedOrderDetail.order_id),
          measurement_main_id: Number(selectedOrderDetail.measurement_main_id),
          material_master_id: Number(selectedOrderDetail.material_master_id),
          trial_date: formatDateTime(selectedOrderDetail.trial_date),
          delivery_date: formatDateTime(selectedOrderDetail.delivery_date),
          item_amt: selectedOrderDetail.item_amt,
          ord_qty: selectedOrderDetail.ord_qty,
          desc1: selectedOrderDetail.desc1,
          admsite_code: selectedOrder?.user?.admsite_code.toString() || null
        }
      );

      await Toast.show({
        text: 'Order details updated successfully',
        duration: 'short',
        position: 'bottom'
      });

      await fetchOrderDetails(selectedOrder.id);
      await fetchOrders(pagination.currentPage, pagination.perPage);
      setEditOrderDetailDialogVisible(false);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update order details';
      await Toast.show({
        text: errorMessage,
        duration: 'short',
        position: 'bottom'
      });
      console.error('Error:', err);
    } finally {
      setIsSavingDetails(false);
    }
  };

  const getPendingAmountSummary = (order: Order) => {
    return `₹${order.amt_due} (₹${order.ord_amt})`;
  };

  const handleViewPaymentHistory = async () => {
    if (selectedOrder) {
      await fetchPaymentHistory(selectedOrder.id);
      setPaymentHistorySidebarVisible(true);
    }
  };

  const handleItemStatusUpdate = async (statusId: number) => {
    if (!selectedDetail || !selectedOrder) return;

    try {
      setLoading(true);
      await SalesOrderService.updateSalesOrderStatus(selectedDetail.id, {
        status_id: statusId,
      });

      const newStatus = availableStatuses.find(s => parseInt(s.id) === statusId)?.name;

      await Toast.show({
        text: `Item status updated to ${newStatus || 'selected status'}`,
        duration: 'short',
        position: 'bottom'
      });

      await Promise.all([
        fetchOrderDetails(selectedOrder.id),
        fetchOrders(pagination.currentPage, pagination.perPage)
      ]);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update item status';
      await Toast.show({
        text: errorMessage,
        duration: 'short',
        position: 'bottom'
      });
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setStatusSidebarVisible(false);
    }
  };

  const handleViewMeasurement = (item: Order['orderDetails'][0]) => {
    setSelectedItem(item);
    setMeasurementDialogVisible(true);
    if (item.id) {
      fetchMeasurements(Number(item.id));
    }
  };

  const handleEditMeasurement = () => {
    if (!measurementData) return;
    
    const measurementsToEdit = measurementData.measurementDetails.map(detail => ({
      id: detail.measurementMaster.id,
      name: detail.measurementMaster.measurement_name,
      value: detail.measurement_val
    }));
    
    setEditedMeasurements(measurementsToEdit);
    setEditMeasurementDialogVisible(true);
  };

  const handleMeasurementValueChange = (id: string, value: string) => {
    setEditedMeasurements(prev => 
      prev.map(item => 
        item.id === id ? { ...item, value } : item
      )
    );
  };

  const saveEditedMeasurements = async () => {
    try {
      if (!selectedItem?.id || !measurementData) return;

      setIsSaving(true);

      const id = Number(measurementData.measurementDetails[0]?.measurement_main_id);

      const measurementUpdates = editedMeasurements.map((item) => ({
        measurement_main_id: id,
        measurement_master_id: Number(item.id),
        measurement_val: item.value,
      }));

      await SalesOrderService.updateMeasurementsDetails(id, measurementUpdates);

      await Toast.show({
        text: 'Measurements updated successfully',
        duration: 'short',
        position: 'bottom',
      });

      fetchMeasurements(Number(selectedItem.id));
      setEditMeasurementDialogVisible(false);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update measurements';
      await Toast.show({
        text: errorMessage,
        duration: 'short',
        position: 'bottom'
      });
      console.error('Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaymentClick = () => {
    if (selectedOrder) {
        setPaymentForm({
            amount: selectedOrder.amt_due.toString(),
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: '',
            reference: ''
        });
        setPaymentDialogVisible(true);
        fetchPaymentModes();
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedOrder || !paymentForm.amount || !paymentForm.paymentDate || !paymentForm.paymentMethod) {
      await Toast.show({
        text: 'Please fill all required fields',
        duration: 'short',
        position: 'bottom'
      });
      return;
    }
  
    try {
      const paymentData = {
        user_id: Number(selectedOrder.user?.id),
        order_id: Number(selectedOrder.id),
        admsite_code: selectedOrder.user?.admsite_code,
        payment_date: paymentForm.paymentDate,
        payment_mode: paymentForm.paymentMethod,
        payment_ref: paymentForm.reference || null,
        payment_amt: parseFloat(paymentForm.amount),
      };
  
      await JobOrderService.createPaymentMain(paymentData);

      await Toast.show({
        text: 'Payment recieved successfully',
        duration: 'short',
        position: 'bottom'
      });
  
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        reference: '',
        paymentMethod: ''
      });
      setVisible(false);
      setPaymentDialogVisible(false);
      await fetchOrders(1, pagination.perPage);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to record payment';
      await Toast.show({
        text: errorMessage,
        duration: 'short',
        position: 'bottom'
      });
      console.error('Error:', err);
    }
  };

  const openItemActionSidebar = (detail: Order['orderDetails'][0]) => {
    setSelectedDetail(detail);
    const maxQty = detail.ord_qty - detail.delivered_qty - detail.cancelled_qty;
    setQuantity(maxQty);
    setItemActionSidebarVisible(true);
  };
  
  const handleStatusQuantityChange = (value: number) => {
    if (!selectedDetail) return;
    const maxQty = selectedDetail.ord_qty - selectedDetail.delivered_qty - selectedDetail.cancelled_qty;
    setQuantity(Math.min(Math.max(1, value), maxQty));
  };
  
  const handleDelivered = async () => {
    if (!selectedDetail || !selectedOrder) return;
    
    try {
      await SalesOrderService.markOrderDelivered(
        selectedOrder.id,
        quantity
      );
      
      await Toast.show({
        text: 'Item marked as delivered',
        duration: 'short',
        position: 'bottom'
      });
      
      await fetchOrderDetails(selectedOrder.id);
      setItemActionSidebarVisible(false);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update delivery status';
      await Toast.show({
        text: errorMessage,
        duration: 'short',
        position: 'bottom'
      });
      console.error('Error:', err);
    }
  };
  
  const handleCancelled = async () => {
    if (!selectedDetail || !selectedOrder) return;
    
    try {
      await SalesOrderService.markOrderCancelled(
        selectedOrder.id,
        quantity
      );
      
      await Toast.show({
        text: 'Item marked as cancelled',
        duration: 'short',
        position: 'bottom'
      });
      
      await fetchOrderDetails(selectedOrder.id);
      setItemActionSidebarVisible(false);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update cancellation status';
      await Toast.show({
        text: errorMessage,
        duration: 'short',
        position: 'bottom'
      });
      console.error('Error:', err);
    }
  };


const [orderItemDialogVisible, setOrderItemDialogVisible] = useState(false);


const handleViewOrderItem = async (item: Order['orderDetails'][0]) => {
  try {
    setSelectedItem(item); // for the dialog
    setOrderItemDialogVisible(true); // ✅ Must match the dialog that shows Item Ref / Job Order No
    if (item.id) {
      await fetchMeasurements(Number(item.id)); // optional if you want to preload measurement
    }
  } catch (err) {
    console.error('Error opening item detail:', err);
  }
};

const [itemMeasurements, setItemMeasurements] = useState<{ [id: string]: MeasurementData }>({});






const getMeasurementValue = (name: string, measurement: MeasurementData): string => {
  return (
    measurement.measurementDetails.find(
      (m) => m.measurementMaster.measurement_name.toLowerCase() === name.toLowerCase()
    )?.measurement_val || 'N/A'
  );
};



const fetchMeasurementDirect = async (orderDetailId: number): Promise<MeasurementData | null> => {
  try {
    const res = await SalesOrderService.getOrderMeasurements(orderDetailId);
    return res?.orderDetail?.measurementMain || null;
  } catch {
    return null;
  }
};



useEffect(() => {
  const fetchAllMeasurements = async () => {
    if (!selectedOrder) return;

    for (const detail of selectedOrder.orderDetails) {
      const res = await fetchMeasurementDirect(Number(detail.id));
      if (res) {
        setItemMeasurements(prev => ({
          ...prev,
          [detail.id]: res,
        }));
      }
    }
  };

  if (orderItemDialogVisible) {
    fetchAllMeasurements();
  }
}, [orderItemDialogVisible, selectedOrder]);

// inside the component that renders the dropdown
const [localStatusId, setLocalStatusId] = useState<string | undefined>(selectedDetail?.orderStatus?.id);

useEffect(() => {
  // update local state if selectedDetail changes
  setLocalStatusId(selectedDetail?.orderStatus?.id);
}, [selectedDetail]);

const searchParams1 = useSearchParams();
const oid = searchParams.get('id');

useEffect(() => {
  if (oid) {
    fetchOrderDetails(oid); // Your existing method
    setVisible(true); // This opens the dialog
  }
}, [oid]);



//   setLoadingMeasurements(true);
//   await fetchMeasurements(Number(orderDetailId)); // this sets global `measurementData`

//   if (measurementData) {
//     setItemMeasurements(prev => ({
//       ...prev,
//       [orderDetailId]: measurementData
//     }));
//   }

//   setLoadingMeasurements(false);
// };







  if (loading && !isFetchingMore && !debouncedSearchTerm) {
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
                <div className="flex flex-column gap-2">
                  <div className="flex justify-content-between align-items-center">
                    <Skeleton width="8rem" height="1.25rem" />
                    <Skeleton width="5rem" height="1.25rem" />
                  </div>
  
                  <Divider className="my-2" />
  
                  <div className="flex flex-column gap-1">
                    <div className="flex justify-content-between">
                      <Skeleton width="6rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                    <div className="flex justify-content-between">
                      <Skeleton width="6rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                    <div className="flex justify-content-between">
                      <Skeleton width="6rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                    <div className="flex justify-content-between">
                      <Skeleton width="6rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                    <div className="flex justify-content-between">
                      <Skeleton width="8rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                    <div className="flex justify-content-between">
                      <Skeleton width="8rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                  </div>
  
                  <Divider className="my-2" />
  
                  <Skeleton width="5rem" height="1rem" />
                  <Skeleton width="100%" height="2rem" className="mt-2" />
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }  

  return (
    <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {(isSaving || isSavingDetails) && <FullPageLoader />}
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0">Sales Orders</h2>
        <span className="p-input-icon-left p-input-icon-right w-full">
          <i className="pi pi-search" />
          <InputText 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="w-full"
          />
          
          {loading && debouncedSearchTerm ? (
            <i className="pi pi-spin pi-spinner" />
          ) : searchTerm ? (
            <i 
              className="pi pi-times cursor-pointer" 
              onClick={() => {
                setSearchTerm('');
              }}
            />
          ) : null}
        </span>
        <Button 
          label="Create Order" 
          icon="pi pi-plus" 
          onClick={handleAddOrder}
          className="w-full md:w-auto"
          size="small"
        />
      </div>
      
      <div className="grid">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div 
              key={order.id} 
              className="col-12 md:col-6 lg:col-4"
              ref={index === orders.length - 1 ? lastOrderRef : null}
            >
              <Card className="h-full">
                <div className="flex flex-column gap-2">
                  <div className="flex justify-content-between align-items-center">
                    <span className="font-bold">{order.docno}</span>
                    <Tag 
                      value={order.orderStatus?.status_name || 'Unknown'}
                      severity={getStatusSeverity(order.orderStatus?.status_name)} 
                    />
                  </div>
                  
                  <Divider className="my-2" />
                  
                  <div className="flex flex-column gap-1">
                    <div className="flex justify-content-between">
                      <span className="text-600">Customer:</span>
                      <span>{order.customer}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Order Date:</span>
                      <span>{formatDate(new Date(order.order_date))}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Delivered:</span>
                      <span>{order.delivered_qty}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Payment Pending:</span>
                      <span>{getPendingAmountSummary(order)}</span>
                    </div>
                  </div>
                  
                  <Divider className="my-2" />
                  
                  <div className="flex flex-column gap-1">
                    <span className="text-600">Notes:</span>
                    <p className="m-0 text-sm">{order.desc1 || 'No notes'}</p>
                  </div>
                  
                  <div className="mt-3">
                    <Button 
                      label="View Details" 
                      icon="pi pi-eye"
                      onClick={() => openOrderDetails(order)}
                      className="w-full p-button-sm"
                    />
                  </div>
                </div>
              </Card>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="p-4 text-center surface-100 border-round">
              <i className="pi pi-search text-3xl mb-1" />
              <h4>No orders found</h4>
            </div>
          </div>
        )}
      </div>

      {isFetchingMore && (
        <div className="flex justify-content-center mt-3">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-spinner pi-spin" />
            <span>Loading more orders...</span>
          </div>
        </div>
      )}

      {/* <Dialog 
        header={`Order Details - ${selectedOrder?.docno}`} 
        visible={visible} 
        onHide={handleDialogClose}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
      >
        {listLoading ? (
          <div className="p-fluid mt-3">
            <div className="mb-4">
              <Skeleton width="100%" height="10rem" borderRadius="6px" className="mb-5" />
              <Skeleton width="100%" height="2.5rem" borderRadius="6px" className="mb-5" />
              <Skeleton width="100%" height="20rem" className="mb-1" />
            </div>

            <div className="grid">
              <div className="col-12 md:col-4 mb-2">
                <Skeleton width="100%" height="2.5rem" borderRadius="6px" />
              </div>
              <div className="col-12 md:col-4 mb-2">
                <Skeleton width="100%" height="2.5rem" borderRadius="6px" />
              </div>
              <div className="col-12 md:col-4 mb-2">
                <Skeleton width="100%" height="2.5rem" borderRadius="6px" />
              </div>
            </div>
          </div>
        ) : selectedOrder ? (
          <div className="p-fluid mt-3">
            <div className="grid">
              <div className="col-6">
                <div className="field">
                  <label>Customer</label>
                  <p className="m-0 font-medium">{selectedOrder?.user?.fname}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Order Date</label>
                  <p className="m-0 font-medium">{formatDate(new Date(selectedOrder.order_date))}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Status</label>&nbsp;
                  <Tag 
                    value={selectedOrder.orderStatus?.status_name || 'Unknown'}
                    severity={getStatusSeverity(selectedOrder.orderStatus?.status_name) || undefined}
                    className="text-sm font-semibold"
                    style={{ minWidth: '6rem', textAlign: 'center' }}
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label>Trial Date</label>
                  <p className="m-0 font-medium">{selectedOrder.orderDetails?.some(item => item.trial_date) 
                    ? formatDate(new Date(selectedOrder.orderDetails.find(item => item.trial_date)?.trial_date || '')) 
                    : 'Not scheduled'}</p>
                </div>
              </div>
              <div className="col-12">
                <div className="flex gap-2 mt-3">
                  <Button
                    label="Receive Payment"
                    icon="pi pi-wallet"
                    onClick={handlePaymentClick}
                    disabled={selectedOrder?.amt_due === 0 || selectedOrder?.amt_due === undefined}
                  />
                  <Button
                    icon={loadingPaymentHistory ? 'pi pi-spin pi-spinner' : 'pi pi-history'}
                    style={{ width: '20%' }}
                    onClick={handleViewPaymentHistory}
                    className="p-button-secondary"
                    disabled={loadingPaymentHistory}
                  />
                </div>
              </div>
            </div>

            <Divider />
            
            <h5 className="m-0 mb-3">Order Items</h5>

            {selectedOrder.orderDetails?.map((item) => (
              <div key={item.id} className="mb-4 surface-50 p-3 border-round">
                <div className="grid">
                  <div className="col-6">
                    <div className="field">
                      <label>Item Ref</label>
                      <p className="m-0 font-medium">{item.item_ref || 'Not Available'}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Job Order No</label>
                      <p className="m-0 font-medium">{item.order_id}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Item Name</label>
                      <p className="m-0 font-medium">{item.material?.name || 'Not Available'}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Jobber Name</label>
                      <p className="m-0 font-medium">{item.jobOrderDetails?.[0]?.adminSite?.sitename || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Trial Date</label>
                      <p className="m-0 font-medium">
                        {item.trial_date ? formatDate(new Date(item.trial_date)) : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Amount</label>
                      <p className="m-0 font-medium">₹ {item.item_amt || 0}</p>
                    </div>
                  </div>
                  <div className="col-12 mt-2">
                    <div className="grid align-items-start">
                      <div className="col-9">
                        <div className="field">
                          <label>Notes</label>
                          <p className="m-0 font-medium">{item.desc1 || 'No Notes Available'}</p>
                        </div>
                      </div>
                      <div className="col-3 flex justify-content-end pt-4">
                        <Button 
                          icon="pi pi-pencil" 
                          onClick={() => handleEditOrderDetail(item)}
                          className="p-button-rounded p-button"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 mt-2">
                    <Button
                      label={`Status (${item.orderStatus?.status_name || 'Unknown'})`}
                      icon="pi pi-sync"
                      onClick={() => {
                        setSelectedDetail(item);
                        setStatusSidebarVisible(true);
                      }}
                      severity={getStatusSeverity(item.orderStatus?.status_name) || undefined}
                    />
                  </div>

                  {item?.image_url && item.image_url.length > 0 && (
                    <div className="col-12 mt-2">
                      <Button 
                        label={`View Images (${item.image_url.length})`} 
                        icon="pi pi-image" 
                        className="p-button-outlined"
                        onClick={() => handleImagePreview(item.image_url)}
                      />
                    </div>
                  )}

                  <div className="col-12 mt-2">
                    <Button 
                      label="View Measurement Details" 
                      icon="pi pi-eye" 
                      className="p-button-outlined"
                      onClick={() => handleViewMeasurement(item)}
                    />
                  </div>

                  <div className="col-12 mt-2">
                    <Button 
                      label="Update Status"
                      icon="pi pi-pencil" 
                      onClick={() => openItemActionSidebar(item)}
                      className="w-full"
                    />
                  </div>
                  <Divider />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
            <p>No order details available</p>
          </div>
        )}
      </Dialog> */}

<Dialog 
  header={`Order Details - ${selectedOrder?.docno}`} 
  visible={visible} 
  onHide={handleDialogClose}
  maximized={isMaximized}
  onMaximize={(e) => setIsMaximized(e.maximized)}
  className={isMaximized ? 'maximized-dialog' : ''}
  blockScroll
>
  {listLoading ? (
    <Skeleton height="400px" />
  ) : selectedOrder ? (
    <>
    {console.log('✅ selectedOrder:', selectedOrder)}
    <div className="p-4">
      

      {/* Order Info Section */}
      <div className="space-y-4">

  {/* Name Row */}

<div className="flex justify-between items-center border-b pb-1 w-full">
  <span className="text-sm text-gray-600 w-28">Name</span>
  <span className="text-sm font-medium text-right flex-1 truncate">
    {selectedOrder?.user?.fname || 'N/A'}
  </span>
</div>



  {/* Phone Number Row */}
  <div className="flex justify-between items-center border-b pb-1 w-full">
  <span className="text-sm text-gray-600 w-28">Phone No</span>
  <span className="text-sm font-medium text-right flex-1 truncate">
    {selectedOrder?.customer|| 'N/A'}
  </span>
</div>


  {/* Order Number Row */}
  <div className="flex justify-between items-center border-b pb-1 w-full">
  <p className="text-sm text-gray-600 w-28">Order Number</p>
  <a
    href="#"
    className="text-blue-600 font-semibold text-right flex-1 truncate"
  >
    {selectedOrder?.docno || 'N/A'}
  </a>
</div>


</div>


      {/* Order Items Section */}


<div className="mb-4">
  <h5 className="m-0 mb-3">Order Items</h5>

  {selectedOrder?.orderDetails?.map((item) => (


<div className="flex items-center justify-between mb-2">
 
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      handleViewOrderItem(item);
    }}
    className="text-sm font-semibold text-blue-600 hover:underline"
  >
    #{item.material?.name || 'Item'}
  </a>

 
  <div className="flex items-center gap-3 ml-auto text-blue-600 text-sm">
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
      handleViewOrderItem(item);
      }}
      className="hover:text-blue-800"
      title="Print Bill"
    >
      <i className="pi pi-print text-base" />
    </a>

    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        handleViewOrderItem(item);
      }}
      className="font-medium hover:underline"
    >
      View
    </a>
  </div>
</div>

  ))}
</div>



{selectedOrder?.orderDetails?.map((item) => (
  <div
    key={item.id}
    className="bg-gray-50 p-4 rounded mb-4 shadow-sm text-sm text-gray-800"
  >
   

    <div className="flex justify-between items-center border-b pb-1 w-full">
      <span className="text-sm text-gray-600 w-28">#{item.material?.name || 'Item'}</span>
    <span className="text-sm font-medium text-right flex-1 truncate">₹{Number(item.item_amt)}</span>
    </div>

   

<div className="flex justify-between items-center border-b pb-1 w-full">
  <span className="text-sm text-gray-600 w-28">Stitching Cost</span>
<span className="text-sm font-medium text-right flex-1 truncate">    1 × ₹{Number(item.item_amt)} = ₹{Number(item.item_amt)}</span>
</div>



   

<div className="flex justify-between items-center border-b pb-1 w-full">
  <span className="text-sm text-gray-600 w-28">Total</span>
<span className="text-sm font-medium text-right flex-1 truncate">₹{Number(item.item_amt)}</span>
</div>

  </div>
))}













      {/* Amount Info */}
      <div className="bg-blue-50 p-3 rounded text-sm mb-4">
      
<div className="flex justify-between items-center border-b pb-1 w-full">
  <span className="text-sm text-gray-600 w-28">Advance Amount</span>
<span className="text-sm font-medium text-right flex-1 truncate">₹{selectedOrder?.amt_paid || 0}</span>
</div>

      

        <div className="flex justify-between items-center border-b pb-1 w-full">
  <span className="text-sm text-gray-600 w-28">Balance Due</span>
<span className="text-sm font-medium text-red-500 font-bold text-right flex-1 truncate">₹{selectedOrder?.amt_due || 0}</span>
</div>
      </div>

      

<div className="text-center text-sm text-gray-600 my-6">
  {/* Top row: icon + Transactions */}
  <div className="flex justify-center items-center gap-1 mb-1">
    <span className="text-gray-500 text-base">📄</span> {/* or an icon */}
    <span className="font-semibold text-gray-700">Transactions</span>
  </div>

  {/* Bottom row: message */}
  <div className="text-gray-400">No Record Found!</div>
</div>


      



<div className="flex mb-4 gap-2">
  <Button className="p-button-success m"   style={{ width: "50%" }} label="Send Bill" icon="pi pi-send" />
  <Button className="p-button-outlined"   style={{ width: "50%" }} label="Print Bill" icon="pi pi-print" />
</div>



<Button
  label="Receive Payment" 
  className="w-full p-button-info"
  onClick={handlePaymentClick}
/>



    </div>
    </>
  ) : (
    <div className="text-center p-4">
      <p>No order details available</p>
    </div>
  )}
</Dialog>


<Dialog
  header={
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 text-blue-600 cursor-pointer"
          onClick={() => {
            if (selectedItem) handleEditOrderDetail(selectedItem);
          }}
        >
          <i className="pi pi-pencil" />
          <span className="font-medium">Edit</span>
        </div>
        <div className="text-red-600 cursor-pointer" title="Delete">
          <i className="pi pi-trash" />
        </div>
      </div>
      {/* <div className="flex gap-5" style={{ paddingLeft: '625px' }}>
       
        <i className="pi pi-print text-blue-600 cursor-pointer" title="Print" />     
        <i className="pi pi-whatsapp text-green-600 cursor-pointer" title="WhatsApp" />
        <i className="pi pi-download text-gray-600 cursor-pointer" title="Download" />
      </div> */}
      <div className="flex justify-end gap-5">
  <div className="text-blue-600 cursor-pointer" title="Print">
    <i className="pi pi-print" />
  </div>
  <div className="text-green-600 cursor-pointer" title="WhatsApp">
    <i className="pi pi-whatsapp" />
  </div>
  <div className="text-gray-600 cursor-pointer" title="Download">
    <i className="pi pi-download" />
  </div>
</div>

    </div>
  }
  visible={orderItemDialogVisible}
  onHide={() => setOrderItemDialogVisible(false)}
  style={{ width: '60vw' }}
  breakpoints={{ '960px': '95vw' }}
>
  <div className="bg-white p-4 rounded">
    {/* Show metadata ONCE */}
    <div className="mb-4">
      <div className="flex justify-between items-center border-b pb-1 w-full">
        <span className="text-sm text-gray-600 w-28">Name</span>
        <span className="text-sm font-medium text-right flex-1 truncate">
          {selectedOrder?.user?.fname || 'Customer'}
        </span>
      </div>
      <div className="flex justify-between items-center border-b pb-1 w-full">
        <span className="text-sm text-gray-600 w-28">Order Number</span>
        <span className="text-sm font-medium text-right flex-1 truncate">
          {selectedOrder?.docno}
        </span>
      </div>
      <div className="flex justify-between items-center border-b pb-1 w-full">
        <span className="text-sm text-gray-600 w-28">Delivery date</span>
        <span className="text-sm font-medium text-right flex-1 truncate">
          {selectedOrder?.delivery_date
            ? new Date(selectedOrder.delivery_date).toLocaleString('en-IN')
            : 'Not scheduled'}
        </span>
      </div>
      <div className="flex justify-between items-center border-b pb-1 w-full">
        <span className="text-sm text-gray-600 w-28">Trial date</span>
        <span className="text-sm font-medium text-right flex-1 truncate">
          {selectedOrder?.tentitive_delivery_date
            ? new Date(selectedOrder.tentitive_delivery_date).toLocaleString('en-IN')
            : 'Not scheduled'}
        </span>
      </div>
      <div className="flex justify-between items-center border-b pb-1 w-full">
        <span className="text-sm text-gray-600 w-28">Type</span>
        <span className="text-sm font-medium text-right flex-1 truncate">Stitching</span>
      </div>
      <div className="flex justify-between items-center border-b pb-1 w-full">
        <span className="text-sm text-gray-600 w-28">Status</span>
       <span className='text-sm font-medium text-right flex-1 truncate'>
  <select
    value={localStatusId}
    onChange={(e) => {
      const newId = e.target.value;
      setLocalStatusId(newId);
      handleItemStatusUpdate(Number(newId));
    }}
    style={{
      backgroundColor: 'antiquewhite'  
    }}
    className="border border-gray-300 rounded px-3 py-1 text-sm text-red-600 text-center"
  >
    {availableStatuses.map((status) => (
      <option key={status.id} value={status.id}>
        {status.name}
      </option>
    ))}
  </select>
  </span>
      </div>
    </div>

    {/* Loop each item and show measurements */}
    {selectedOrder?.orderDetails?.map((detail) => {
      const measurement = itemMeasurements[detail.id];

      return (
        <div key={detail.id} className="mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-2 mt-4 bg-gray-200 px-3 py-2 rounded">
            {detail.material?.name || 'Item'}
          </div>

          {measurement && (
            <div className="bg-gray-100 p-3 rounded border border-gray-300 mb-4">
              <div className="flex justify-between items-center border-b pb-1 w-full">
                <span className="text-sm font-semibold text-gray-800 mb-2">Measurements</span>
                <span className="text-xs text-gray-500 mb-2 text-right flex-1 truncate">
                  Taken on: {new Date(measurement.measurement_date).toLocaleString()}
                </span>
              </div>

              {measurement.measurementDetails.map((m, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-1 w-full">
                  <span className="text-sm text-gray-600">{m.measurementMaster.measurement_name}</span>
                  <span className="text-sm font-medium text-right flex-1 truncate">{m.measurement_val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    })}

   {/* Combined Price Breakup */}
<div className="border-t border-gray-200 pt-3 mt-6" style={{ backgroundColor: '#f3f4f6' }}>
  <div className="flex justify-between items-center border-b pb-1 w-full">
    <span className="text-sm font-semibold mb-2 text-gray-900">Price Breakup</span>
  </div>

  {selectedOrder?.orderDetails?.map((detail, index) => (
    <div key={index} className="flex justify-between items-center border-b pb-1 w-full">
      <span className="text-sm text-gray-800">{detail.material?.name || `Item ${index + 1}`}</span>
      <span className="text-sm font-medium text-right flex-1 truncate">
        {detail.ord_qty || 1} × ₹{detail.item_amt?.toFixed(2) || '0.00'}
      </span>
    </div>
  ))}

  <div className="flex justify-between font-bold text-sm text-gray-900 border-t border-dashed mt-2 pt-2">
    <span className="text-sm font-semibold">Total:</span>
    <span className="text-sm font-medium text-right flex-1 truncate">
      ₹
      {selectedOrder?.orderDetails
        ?.reduce((acc, item) => acc + (item.item_amt || 0) * (item.ord_qty || 1), 0)
        .toFixed(2)}
    </span>
  </div>
</div>
</div>
</Dialog>







      <Dialog 
        visible={imagePreviewVisible} 
        onHide={() => setImagePreviewVisible(false)}
        style={{ width: '90vw' }}
      >
        <Galleria
          value={images}
          activeIndex={activeImageIndex}
          onItemChange={(e) => setActiveImageIndex(e.index)}
          showThumbnails={false}
          showIndicators={images.length > 1}
          showItemNavigators={images.length > 1}
          item={itemTemplate}
          thumbnail={thumbnailTemplate}
          style={{ width: '100%' }}
        />
      </Dialog>

      <Dialog 
        header="Receive Payment"
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
              onChange={(e) => {
                const enteredAmount = parseFloat(e.target.value) || 0;
                const maxAllowed = selectedOrder?.amt_due || 0;
                if (enteredAmount <= maxAllowed) {
                  setPaymentForm({...paymentForm, amount: e.target.value});
                } else {
                  Toast.show({
                    text: `Amount cannot exceed ₹${maxAllowed}`,
                    duration: 'short',
                    position: 'bottom'
                  });
                  setPaymentForm({...paymentForm, amount: maxAllowed.toString()});
                }
              }}
              max={selectedOrder?.amt_due}
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="paymentDate" className="font-bold block mb-2">
              Payment Date
            </label>
            <Calendar
              id="paymentDate"
              value={new Date(paymentForm.paymentDate)}
              onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.value?.toISOString().split('T')[0] || ''})}
              dateFormat="dd-mm-yy"
              showIcon
              className="w-full"
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
              placeholder={paymentModes.length ? "Select payment method" : "Loading payment methods..."}
              className="w-full"
              onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.value})}
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
              onClick={() => {
                setPaymentDialogVisible(false);
                setPaymentForm({
                  amount: '',
                  paymentDate: new Date().toISOString().split('T')[0],
                  reference: '',
                  paymentMethod: ''
                });
              }}
            />
            <Button 
              label="Confirm" 
              icon="pi pi-check" 
              className="p-button-success"
              onClick={handlePaymentSubmit}
              disabled={!paymentForm.amount || !paymentForm.paymentDate || !paymentForm.paymentMethod || parseFloat(paymentForm.amount) > (selectedOrder?.amt_due || 0)}
            />
          </div>
        </div>
      </Dialog>

    <Sidebar 
        visible={paymentHistorySidebarVisible}
        onHide={() => setPaymentHistorySidebarVisible(false)}
        position="bottom"
        style={{ 
          width: '100vw',
          height: '68vh',
          maxHeight: '68vh',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
        }}
        className="custom-selector-sidebar"
        header={
          <div className="flex align-items-center gap-2">
            <span className="font-bold text-xl">Payment History</span>
          </div>
        }
      >
        {loadingPaymentHistory ? (
          <div className="flex justify-content-center p-4">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          </div>
        ) : paymentHistory.length > 0 ? (
          <div className="flex flex-column gap-2 p-2">
            {paymentHistory.map((payment, index) => (
              <div key={index} className="flex justify-content-between align-items-center border-1 surface-border p-3 border-round">
                <div className="text-sm">
                  <div className="text-500">Date</div>
                  <div className="font-medium">{new Date(payment.payment_date).toLocaleDateString('en-IN')}</div>
                </div>
                <div className="text-sm text-right">
                  <div className="text-500">Amount</div>
                  <div className="font-medium">₹{payment.payment_amt}</div>
                </div>
                <div className="text-sm text-right">
                  <div className="text-500">Method</div>
                  <div className="font-medium">
                    {payment.paymentMode?.mode_name || payment.payment_type || 'Unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-column align-items-center justify-content-center p-5">
            <i className="pi pi-info-circle text-2xl mb-2"></i>
            <p className="text-500 m-0">No payment history found</p>
          </div>
        )}
      </Sidebar>

      <Sidebar 
        visible={itemActionSidebarVisible}
        onHide={() => setItemActionSidebarVisible(false)}
        position="bottom"
        style={{ 
          width: '100%',
          height: 'auto',
          maxHeight: '80vh',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
        }}
        className="custom-item-action-sidebar"
        header={
          <div className="sticky top-0 bg-white z-1 p-3 surface-border flex justify-content-between align-items-center">
            <span className="font-bold text-xl mr-2">
              {/* {selectedDetail?.material?.name || 'Item Actions'} */}
            </span>
            <span className="text-sm text-500">
              Max: {selectedDetail ? selectedDetail.ord_qty - selectedDetail.delivered_qty - selectedDetail.cancelled_qty : 0}
            </span>
          </div>
        }
        blockScroll
      >
        {selectedDetail && (
          <div className="p-3">
            <div className="field mb-4">
              <label className="font-bold block mb-2">Quantity</label>
              <div className="flex align-items-center justify-content-between bg-gray-100 p-2 border-round">
                <Button
                  icon="pi pi-minus" 
                  onClick={() => handleStatusQuantityChange(quantity - 1)}
                  className="p-button-rounded p-button-text"
                  disabled={quantity <= 1}
                />
                <InputText 
                  value={String(quantity)}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 1;
                    const maxQty = selectedDetail.ord_qty - selectedDetail.delivered_qty - selectedDetail.cancelled_qty;
                    handleStatusQuantityChange(Math.min(newValue, maxQty));
                  }}
                  className="text-center mx-2 bg-white"
                  style={{ width: '60px' }}
                  keyfilter="int"
                />
                <Button 
                  icon="pi pi-plus" 
                  onClick={() => handleStatusQuantityChange(quantity + 1)}
                  className="p-button-rounded p-button-text"
                  disabled={quantity >= (selectedDetail.ord_qty - selectedDetail.delivered_qty - selectedDetail.cancelled_qty)}
                />
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <Button 
                label="Cancelled" 
                icon="pi pi-times" 
                onClick={() => setConfirmCancelledVisible(true)}
                className="flex-grow-1 p-button-danger"
              />
              <Button 
                label="Delivered" 
                icon="pi pi-check" 
                onClick={() => setConfirmDeliveredVisible(true)}
                className="flex-grow-1 p-button-success"
              />
            </div>
          </div>
        )}
      </Sidebar>

      <Sidebar 
        visible={statusSidebarVisible} 
        onHide={() => setStatusSidebarVisible(false)}
        position="bottom"
        style={{ 
          width: '100%',
          height: 'auto',
          maxHeight: '62vh',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
        }}
        header={
          <div className="sticky top-0 bg-white z-1 p-3 border-bottom-1 surface-border flex justify-content-between align-items-center">
            <span className="font-bold text-xl">Update Item Status</span>
          </div>
        }
        className="p-0"
      >
        <div className="p-3">
          <div className="grid">
            {availableStatuses.map(status => (
              <div key={status.id} className="col-12 md:col-6 lg:col-4 p-2">
                <Button
                  label={status.name}
                  onClick={() => handleItemStatusUpdate(parseInt(status.id))}
                  severity={getStatusSeverity(status.name) || undefined}
                  className="w-full p-3 text-lg justify-content-start p-button-outlined"
                  icon={
                    status.name === 'Completed' ? 'pi pi-check-circle' :
                    status.name === 'In Progress' ? 'pi pi-spinner' :
                    status.name === 'Pending' ? 'pi pi-clock' :
                    status.name === 'Cancelled' ? 'pi pi-times-circle' :
                    'pi pi-info-circle'
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </Sidebar>

      <Dialog 
        header="Edit Order Details"
        visible={editOrderDetailDialogVisible}
        onHide={() => setEditOrderDetailDialogVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
        footer={
          <div>
            <Button 
              label="Update" 
              icon="pi pi-check" 
              onClick={handleUpdateOrderDetail}
              autoFocus 
              className="w-full"
              loading={isSavingDetails} 
              disabled={isSavingDetails}
            />
          </div>
        }
      >
        {selectedOrderDetail && (
          <div className="p-fluid my-4">
            <div className="field">
              <label htmlFor="trialDate">Trial Date</label>
              <Calendar 
                id="trialDate"
                value={selectedOrderDetail?.trial_date ? new Date(selectedOrderDetail.trial_date) : null}
                onChange={(e) => {
                  if (!selectedOrderDetail) return;
                  setSelectedOrderDetail({
                    ...selectedOrderDetail,
                    trial_date: e.value ? e.value.toISOString() : null
                  });
                }}
                dateFormat="dd/mm/yy"
                showTime
                hourFormat="12"
                showIcon
                placeholder="Select Trial Date & Time"
                minDate={new Date()}
              />
            </div>

            <div className="field">
              <label htmlFor="deliveryDate">Delivery Date</label>
              <Calendar 
                id="deliveryDate"
                value={selectedOrderDetail?.delivery_date ? new Date(selectedOrderDetail.delivery_date) : null}
                onChange={(e) => {
                  if (!selectedOrderDetail) return;
                  setSelectedOrderDetail({
                    ...selectedOrderDetail,
                    delivery_date: e.value ? e.value.toISOString() : null
                  });
                }}
                dateFormat="dd/mm/yy"
                showTime
                hourFormat="12"
                showIcon
                placeholder="Select Delivery Date & Time"
                minDate={new Date()}
              />
            </div>

            <div className="field">
              <label htmlFor="itemAmt">Item Amount</label>
              <InputNumber 
                id="itemAmt"
                value={selectedOrderDetail.item_amt}
                onValueChange={(e) => setSelectedOrderDetail({
                  ...selectedOrderDetail,
                  item_amt: e.value || 0
                })}
                mode="currency" 
                currency="INR" 
                locale="en-IN"
              />
            </div>

            <div className="field">
              <label htmlFor="ordQty">Order Qty</label>
              <InputNumber 
                id="ordQty"
                value={selectedOrderDetail.ord_qty}
                onValueChange={(e) => setSelectedOrderDetail({
                  ...selectedOrderDetail,
                  ord_qty: e.value || 0
                })}
                min={0}
              />
            </div>

            <div className="field">
              <label htmlFor="desc1">Special Instruction</label>
              <InputTextarea 
                id="desc1"
                value={selectedOrderDetail.desc1 || ''} 
                onChange={(e) =>
                  setSelectedOrderDetail({
                    ...selectedOrderDetail,
                    desc1: e.target.value,
                  })
                }
                rows={4}
                autoResize
              />
            </div>
          </div>
        )}
      </Dialog>

      <Dialog 
        header={
          <div className="flex align-items-center w-full">
            <span>Measurement Details</span>
            <Button 
              icon="pi pi-pencil" 
              onClick={handleEditMeasurement}
              className="p-button-rounded p-button-text"
              disabled={!measurementData}
              style={{ marginLeft: '0.5rem' }}
            />
          </div>
        }
        visible={measurementDialogVisible} 
        onHide={() => {
          setMeasurementDialogVisible(false);
          setMeasurementData(null);
        }}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
      >
        {selectedItem && (
          <div className="p-fluid">
            <div className="grid my-2">
              <div className="col-6 font-bold text-600">Customer Name:</div>
              <div className="col-6 font-medium text-right">{selectedOrder?.user?.fname}</div>
              
            <div className="col-6 font-bold text-600">Delivery Date:</div>
              <div className="col-6 font-medium text-right">
                {selectedItem.delivery_date ? formatDate(new Date(selectedItem.delivery_date)) : 'Not scheduled'}
              </div>
              
              <div className="col-6 font-bold text-600">Trial Date:</div>
              <div className="col-6 font-medium text-right">
                {selectedItem.trial_date ? formatDate(new Date(selectedItem.trial_date)) : 'Not scheduled'}
              </div>
            </div>

            {loadingMeasurements ? (
              <div className="surface-100 p-3 border-round my-4">
                <div className="flex align-items-center gap-3">
                  <Skeleton shape="circle" size="2rem" />
                  <div className="flex flex-column gap-2 w-full">
                    <Skeleton width="100%" height="1.5rem" />
                    <Skeleton width="50%" height="1rem" />
                  </div>
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="grid my-3">
                    <div className="col-6">
                      <Skeleton width="80%" height="1.5rem" />
                    </div>
                    <div className="col-6">
                      <Skeleton width="60%" height="1.5rem" className="float-right" />
                    </div>
                  </div>
                ))}
              </div>
            ) : measurementData && measurementData.measurementDetails?.length > 0 ? (
              <>
                <div className="surface-100 p-3 border-round my-4">
                  <h4 className="m-0">Measurements</h4>
                  <p className="text-sm mt-1">
                    Taken on: {new Date(measurementData.measurement_date).toLocaleString()}
                  </p>
                </div>

                <div className="grid mb-4">
                  {measurementData.measurementDetails.map((detail, index) => (
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
              {loadingMeasurements ? (
                <div className="grid">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="col-6">
                      <Skeleton width="80%" height="1.5rem" className="mb-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid">
                  <div className="col-6 font-bold text-600">Collar:</div>
                  <div className="col-6 font-medium text-right">
                    {measurementData ? 'Classic' : 'No details available'}
                  </div>
                  
                  <div className="col-6 font-bold text-600">Sleeve:</div>
                  <div className="col-6 font-medium text-right">
                    {measurementData ? 'Full' : 'No details available'}
                  </div>
                  
                  <div className="col-6 font-bold text-600">Cuffs:</div>
                  <div className="col-6 font-medium text-right">
                    {measurementData ? 'Squared' : 'No details available'}
                  </div>
                  
                  <div className="col-6 font-bold text-600">Pocket Type:</div>
                  <div className="col-6 font-medium text-right">
                    {measurementData ? 'Classic' : 'No details available'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      <Dialog 
        header="Edit Measurement Details"
        visible={editMeasurementDialogVisible}
        onHide={() => setEditMeasurementDialogVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
        footer={
          <div>
            <Button 
              label="Update" 
              icon="pi pi-check" 
              onClick={saveEditedMeasurements}
              autoFocus
              className="w-full"
              loading={isSaving} 
              disabled={isSaving}
            />
          </div>
        }
      >
        <div className="p-fluid">
          {editedMeasurements.map((measurement) => {
            const measurementDetail = measurementData?.measurementDetails.find(
              detail => detail.measurementMaster.id === measurement.id
            );
            
            const dataType = measurementDetail?.measurementMaster.data_type || 'text';
            
            return (
              <div key={measurement.id} className="field my-3">
                <label htmlFor={`measurement-${measurement.id}`} className="font-bold block mb-1">
                  {measurement.name} <span className="text-500 font-normal">({dataType})</span>
                </label>
                <InputText
                  id={`measurement-${measurement.id}`}
                  value={measurement.value}
                  onChange={(e) => handleMeasurementValueChange(measurement.id, e.target.value)}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>
      </Dialog>

      <Dialog 
        header="Confirm Delivery"
        visible={confirmDeliveredVisible}
        onHide={() => setConfirmDeliveredVisible(false)}
        style={{ width: '450px' }}
        modal
        footer={
          <div>
            <Button 
              label="No" 
              icon="pi pi-times" 
              onClick={() => setConfirmDeliveredVisible(false)} 
              className="p-button-text" 
            />
            <Button 
              label="Yes" 
              icon="pi pi-check" 
              onClick={() => {
                setConfirmDeliveredVisible(false);
                handleDelivered();
              }} 
              autoFocus 
            />
          </div>
        }
      >
        <div className="flex align-items-center justify-content-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          <span>
            Are you sure you want to mark {quantity} items as delivered?
          </span>
        </div>
      </Dialog>

      <Dialog 
        header="Confirm Cancellation"
        visible={confirmCancelledVisible}
        onHide={() => setConfirmCancelledVisible(false)}
        style={{ width: '450px' }}
        modal
        footer={
          <div>
            <Button 
              label="No" 
              icon="pi pi-times" 
              onClick={() => setConfirmCancelledVisible(false)} 
              className="p-button-text" 
            />
            <Button 
              label="Yes" 
              icon="pi pi-check" 
              onClick={() => {
                setConfirmCancelledVisible(false);
                handleCancelled();
              }} 
              autoFocus 
            />
          </div>
        }
      >
        <div className="flex align-items-center justify-content-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          <span>
            Are you sure you want to mark {quantity} items as cancelled?
          </span>
        </div>
      </Dialog>
    </div>
  );
};

export default SalesOrder;