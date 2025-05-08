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
import { Sidebar } from 'primereact/sidebar';
import { Dropdown } from 'primereact/dropdown';
import { SalesOrderService } from '@/demo/service/sales-order.service';
import { JobOrderService } from '@/demo/service/job-order.service';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  }
  orderStatus: {
    id: string;
    status_name: string;
  } | null;
  orderDetails: {
    id: string;
    order_id: string;
    measurement_main_id: string;
    image_url: string | null;
    material_master_id: string;
    trial_date: string;
    delivery_date: string;
    item_amt: number;
    ord_qty: number;
    delivered_qty: number;
    cancelled_qty: number;
    desc1: string | null;
    ext: string;
  }[];
}

interface MeasurementData {
  measurement_date: string;
  measurementDetails: {
    measurement_val: string;
    measurementMaster: {
      id: string;
      measurement_name: string;
    };
  }[];
}

const SalesOrder = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null | undefined>(new Date());
  const [receivePaymentDialog, setReceivePaymentDialog] = useState(false);
  const [receiveAmount, setReceiveAmount] = useState('');
  const [isMaximized, setIsMaximized] = useState(true);
  const [visible, setVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [measurementData, setMeasurementData] = useState<MeasurementData | null>(null);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [statusSidebarVisible, setStatusSidebarVisible] = useState(false);
  const [measurementDialogVisible, setMeasurementDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Order['orderDetails'][0] | null>(null);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [paymentModes, setPaymentModes] = useState<{id: string, mode_name: string}[]>([]);
  const [itemActionSidebarVisible, setItemActionSidebarVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Order['orderDetails'][0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [confirmDeliveredVisible, setConfirmDeliveredVisible] = useState(false);
  const [confirmCancelledVisible, setConfirmCancelledVisible] = useState(false);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [images, setImages] = useState<{itemImageSrc: string}[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 2,
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
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderRef = useRef<HTMLDivElement>(null);

  const availableStatuses = [
    { id: '1', name: 'Pending' },
    { id: '2', name: 'In Progress' },
    { id: '3', name: 'Ready for Trial' },
    { id: '4', name: 'Completed' },
    { id: '5', name: 'Cancelled' }
  ];

  const fetchOrders = useCallback(async (page: number, perPage: number, loadMore = false) => {
    try {
      if (loadMore) {
        setIsFetchingMore(true);
      } else {
        setLoading(true);
      }

      const response = await SalesOrderService.getSalesOrders(page, perPage);
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

      await Toast.show({
        text: `Loaded ${newOrders.length} orders`,
        duration: 'short',
        position: 'top'
      });
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      setError('Failed to fetch orders');
      await Toast.show({
        text: 'Failed to load orders',
        duration: 'long',
        position: 'top'
      });
    } finally {
      if (loadMore) {
        setIsFetchingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders(1, pagination.perPage);
  }, [fetchOrders, pagination.perPage]);

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
      setListLoading(true);
      const res = await SalesOrderService.getSalesOrderById(orderId);
    
      if (res && res.orderDetails) {
        const detailedOrder: Order = res;
        setSelectedOrder(detailedOrder);
        setVisible(true);
      } else {
        throw new Error('Order details are missing from the response');
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setError('Failed to fetch order details');
    } finally {
      setListLoading(false);
    }
  };

  const fetchMeasurements = async (measurementMainId: string) => {
    setLoadingMeasurements(true);
    try {
      const response = await SalesOrderService.getOrderMeasurements(measurementMainId);
      const measurementData = response.data?.orderMain?.orderDetails?.[0]?.measurementMain;
      
      if (measurementData) {
        setMeasurementData(measurementData);
      } else {
        setMeasurementData(null);
      }
    } catch (error) {
      console.error('Failed to load measurements:', error);
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
      default: return null;
    }
  };

  const openOrderDetails = (order: Order) => {
    fetchOrderDetails(order.id);
    fetchPaymentModes();
    setSelectedOrder(order);
    setVisible(true);
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
  
  const handleImagePreview = (imageUrl: string) => {
    setImages([{ itemImageSrc: imageUrl }]);
    setActiveImageIndex(0);
    setImagePreviewVisible(true);
  };

  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleDateString('en-IN') : 'Not scheduled';
  };

  const handleAddOrder = () => {
    router.push('/pages/orders/create-order');
  };

  const filteredOrders = orders.filter((order) =>
    order.docno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPendingAmountSummary = (order: Order) => {
    return `₹${order.amt_due} (₹${order.ord_amt})`;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      if (!selectedOrder) return;
  
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { 
              ...order, 
              orderStatus: order.orderStatus 
                ? { 
                    ...order.orderStatus, 
                    status_name: newStatus 
                  } 
                : { 
                    id: availableStatuses.find(s => s.name === newStatus)?.id || '', 
                    status_name: newStatus 
                  }
            } 
          : order
      ));
      
      setSelectedOrder({
        ...selectedOrder,
        orderStatus: selectedOrder.orderStatus
          ? {
              ...selectedOrder.orderStatus,
              status_name: newStatus
            }
          : {
              id: availableStatuses.find(s => s.name === newStatus)?.id || '',
              status_name: newStatus
            }
      });
      
      await Toast.show({
        text: `Status updated to ${newStatus}`,
        duration: 'long'
      });
      
    } catch (error) {
      console.error('Error updating status:', error);
      await Toast.show({
        text: 'Failed to update status',
        duration: 'short'
      });
    } finally {
      setStatusSidebarVisible(false);
    }
  };

  const handleViewMeasurement = (item: Order['orderDetails'][0]) => {
    setSelectedItem(item);
    setMeasurementDialogVisible(true);
    if (item.id) {
      fetchMeasurements(item.id);
    }
  };  

  const handlePaymentSubmit = async () => {
    if (!selectedOrder || !paymentForm.amount || !paymentForm.paymentDate || !paymentForm.paymentMethod) {
      await Toast.show({
        text: 'Please fill all required fields',
        duration: 'short',
        position: 'top'
      });
      return;
    }
  
    try {
      const paymentData = {
        docno: selectedOrder.docno,
        payment_date: paymentForm.paymentDate,
        payment_mode: paymentForm.paymentMethod,
        payment_ref: paymentForm.reference || null,
        payment_amt: parseFloat(paymentForm.amount),
      };
  
      await JobOrderService.createPaymentMain(paymentData);

      await Toast.show({
        text: 'Payment recieved successfully',
        duration: 'short',
        position: 'top'
      });
  
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        reference: '',
        paymentMethod: ''
      });
      setPaymentDialogVisible(false);
  
    } catch (error) {
      console.error('Error recording payment:', error);
      await Toast.show({
        text: 'Failed to record payment',
        duration: 'short',
        position: 'top'
      });
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
        position: 'top'
      });
      
      await fetchOrderDetails(selectedOrder.id);
      setItemActionSidebarVisible(false);
    } catch (error) {
      await Toast.show({
        text: 'Failed to update delivery status',
        duration: 'short',
        position: 'top'
      });
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
        position: 'top'
      });
      
      await fetchOrderDetails(selectedOrder.id);
      setItemActionSidebarVisible(false);
    } catch (error) {
      await Toast.show({
        text: 'Failed to update cancellation status',
        duration: 'short',
        position: 'top'
      });
    }
  };

  if (loading && !isFetchingMore) {
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
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0">Sales Orders</h2>
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
          label="Create Order" 
          icon="pi pi-plus" 
          onClick={handleAddOrder}
          className="w-full md:w-auto"
          size="small"
        />
      </div>
      
      <div className="grid">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div 
              key={order.id} 
              className="col-12 md:col-6 lg:col-4"
              ref={index === filteredOrders.length - 1 ? lastOrderRef : null}
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

      <Dialog 
        header={`Order Details - ${selectedOrder?.docno}`} 
        visible={visible} 
        onHide={() => setVisible(false)}
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
                  <p className="m-0 font-medium">{formatDate(new Date(selectedOrder.order_date))}</p>
                </div>
              </div>
              <div className="col-12">
                <Button
                  label="Receive Payment"
                  icon="pi pi-wallet"
                  onClick={() => setPaymentDialogVisible(true)}
                  className="mt-3"
                />
              </div>
            </div>

            <Divider />
            
            <h5 className="m-0 mb-3">Order Items</h5>

            {selectedOrder.orderDetails?.map((item) => (
              <div key={item.id} className="mb-4 surface-50 p-3 border-round">
                <div className="grid">
                  <div className="col-6">
                    <div className="field">
                      <label>Item Name</label>
                      <p className="m-0 font-medium">Kurta</p>
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
                      <label>Jobber Name</label>
                      <p className="m-0 font-medium">Amit Kumar</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Trial Date</label>
                      <p className="m-0 font-medium">{formatDate(new Date(selectedOrder.order_date))}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Delivered Qty</label>
                      <p className="m-0 font-medium">{item.delivered_qty}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label>Cancelled Qty</label>
                      <p className="m-0 font-medium">{item.cancelled_qty}</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="field">
                      <label>Notes</label>
                      <p className="m-0 font-medium">{item.desc1 || 'No Notes Available'}</p>
                    </div>
                  </div>

                  <div className="col-12 mt-2">
                    <Button
                      label={`Status (${selectedOrder.orderStatus?.status_name || 'Unknown'})`}
                      icon="pi pi-sync"
                      onClick={() => setStatusSidebarVisible(true)}
                      severity={getStatusSeverity(selectedOrder.orderStatus?.status_name) || undefined}
                    />
                  </div>

                  {item?.image_url && (
                    <div className="col-12 mt-2">
                      <Button 
                        label="View Image" 
                        icon="pi pi-image" 
                        className="p-button-outlined"
                        onClick={() => handleImagePreview(item.image_url || '')}
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
              onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
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
              disabled={!paymentForm.amount || !paymentForm.paymentDate || !paymentForm.paymentMethod}
            />
          </div>
        </div>
      </Dialog>

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
            <span className="font-bold text-xl">Update Order Status</span>
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
                  onClick={() => handleStatusUpdate(status.name)}
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
        header="Measurement Details" 
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
                {formatDate(new Date(selectedItem?.delivery_date))}
              </div>
              
              <div className="col-6 font-bold text-600">Trial Date:</div>
              <div className="col-6 font-medium text-right">
                {formatDate(new Date(selectedItem.trial_date))}
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
            ) : measurementData ? (
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