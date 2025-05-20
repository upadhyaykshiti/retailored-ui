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
import { Calendar } from 'primereact/calendar';
import { JobOrderService } from '@/demo/service/job-order.service';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { ProgressSpinner } from 'primereact/progressspinner';
import { compressImage } from '@/demo/utils/imageCompressUtils';
import { convertImageToBase64, convertImagesToBase64 } from '@/demo/utils/imageUtils';
import { Galleria } from 'primereact/galleria';
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
  image_url: string[] | null;
  admsite_code: number | null;
  trial_date: string | null;
  delivery_date: string | null;
  item_amt: number;
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
  image_url: string[];
  trial_date: string;
  delivery_date: string;
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
  orderDetailId?: string;
}

interface OrderItemDetails {
  quantity: number;
  makingCharge: number;
  image: File | null;
  selectedImages?: string[];
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
  const [uploadingImages, setUploadingImages] = useState<{[key: string]: File | null}>({});
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [selectedMaterialName, setSelectedMaterialName] = useState('');
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrderMain | null>(null);
  const [selectedCode, setSelectedCode] = useState<number | null>(null);
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
  const [itemActionSidebarVisible, setItemActionSidebarVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<JobOrderDetail | null>(null);
  const [confirmDeliveredVisible, setConfirmDeliveredVisible] = useState(false);
  const [confirmCancelledVisible, setConfirmCancelledVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [trialDate, setTrialDate] = useState<Date | null>(new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(new Date());
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [images, setImages] = useState<{itemImageSrc: string}[]>([]);
  const [itemLoadingStates, setItemLoadingStates] = useState<{[key: string]: boolean}>({});
  const [loadingJobbers, setLoadingJobbers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
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
    perPage: 50,
    total: 0
  });
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    hasMorePages: false,
    lastPage: 1,
    perPage: 50,
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
        20,
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
      setLoadingDetails(true);
      const response = await JobOrderService.getJobOrdersDetails(jobOrderId);
      setJobOrderDetails(response.jobOrderDetails);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch job order details',
        life: 3000
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    setLoadingJobbers(true);
    const fetchJobbers = async () => {
      try {
        const response = await JobOrderService.getJobberList();
        response.map(jobber => ({
          label: jobber.sitename,
          value: {
            ...jobber,
            code: jobber.code
          }
        }));
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
        20,
        search || null
      );

      const transformedData = data.map(order => ({
        id: order.id,
        order_id: order.id,
        measurement_main_id:order.measurement_main_id = order.orderDetails[0]?.measurement_main_id || '',
        image_url: [],
        trial_date: '',
        delivery_date: '',
        orderMain: {
          docno: order.docno,
          user: {
            id: order.user.id,
            fname: order.user.fname
          },
          orderDetails: order.orderDetails.map((detail: { id: any; material: { id: any; name: any; }; }) => ({
            id: detail.id,
            ord_qty: 0,
            material: {
              id: detail.material.id,
              name: detail.material.name
            }
          }))
        }
      }));

      setOrdersList(prev => (page === 1 ? transformedData : [...prev, ...transformedData]));
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

  const fetchOrderDetails = async (orderDetailId: string) => {
    try {
      const details = await JobOrderService.getOrderDetails(orderDetailId);
      
      setOrdersList(prev => prev.map(order => {
        const updatedOrderDetails = order.orderMain.orderDetails.map(item => {
          if (item.id === orderDetailId) {
            return {
              ...item,
              ord_qty: details?.ord_qty || 0,
              image_url: details?.image_url || [],
              trial_date: details?.trial_date || '',
              delivery_date: details?.delivery_date || '',
              measurement_main_id: details?.measurement_main_id || ''
            };
          }
          return item;
        });

        return {
          ...order,
          orderMain: {
            ...order.orderMain,
            orderDetails: updatedOrderDetails
          }
        };
      }));
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load order details',
        life: 3000
      });
    }
  };

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
    setVisible(true);
    setSelectedJobOrder(jobOrder);
    await fetchJobOrderDetails(jobOrder.id);
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

  const handleImagePreview = (images: string[] | null) => {
    if (!images || images.length === 0) return;
    
    const imageUrls = images.map(imageUrl => ({
      itemImageSrc: imageUrl
    }));
        
    setImages(imageUrls);
    setActiveImageIndex(0);
    setImagePreviewVisible(true);
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

  const handleItemImageUpload = async (file: File | null) => {
    if (!currentlyEditingItem || !file) return;

    try {
      const MAX_SIZE_MB = 1;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        const compressedFile = await compressImage(file, MAX_SIZE_MB);
        
        if (!compressedFile) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to compress image',
            life: 3000
          });
          return;
        }

        if (compressedFile.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: `Image is too large after compression (max ${MAX_SIZE_MB}MB allowed)`,
            life: 3000
          });
          return;
        }

        file = compressedFile;
      }

      setItemDetails(prev => ({
        ...prev,
        [currentlyEditingItem.id]: {
          ...(prev[currentlyEditingItem.id] || {quantity: 1, makingCharge: 0}),
          image: file
        }
      }));

    } catch (error) {
      console.error('Error processing image:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error processing image',
        life: 3000
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const handleItemSelection = (
    order: OrdersList,
    item: { id: string; material: { id: string; name: string; }; ord_qty: number; }
  ) => {
    const itemKey = `${order.id}-${item.id}`;

    setSelectedItems(prev => {
      const existingIndex = prev.findIndex(selected => selected.id === itemKey);

      if (existingIndex >= 0) {
        return prev.filter(item => item.id !== itemKey);
      } else {
        const selectedItem = {
          id: itemKey,
          materialId: item.material.id,
          measurementMainID: order.measurement_main_id || '',
          name: item.material.name,
          selected: true,
          quantity: item.ord_qty,
          maxQuantity: item.ord_qty,
          orderId: order.orderMain.docno,
          customerName: order.orderMain.user.fname,
          orderUniqueId: order.id,
          orderDetailId: item.id
        };

        return [...prev, selectedItem];
      }
    });
  };


  const handleAddItemClick = async (
    order: OrdersList,
    item: { id: string; material: { id: string; name: string }; ord_qty: number }
  ) => {
    const itemKey = `${order.id}-${item.id}`;

    if (order.image_url.length === 0) {
      setItemLoadingStates(prev => ({ ...prev, [itemKey]: true }));

      try {
        await fetchOrderDetails(item.id);
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load order details',
          life: 3000
        });
      } finally {
        setItemLoadingStates(prev => ({ ...prev, [itemKey]: false }));
      }
    }

    openItemManagement({
      id: itemKey,
      materialId: item.material.id,
      measurementMainID: '',
      name: item.material.name,
      selected: true,
      quantity: item.ord_qty,
      maxQuantity: item.ord_qty,
      orderId: order.orderMain.docno,
      customerName: order.orderMain.user.fname,
      orderUniqueId: order.id,
      orderDetailId: item.id
    });
  };

  const handleSelectAllInOrder = (order: OrdersList, selectAll: boolean) => {
    setSelectedItems(prev => {
      const orderItems = order.orderMain.orderDetails.map(item => ({
        id: `${order.id}-${item.id}`,
        materialId: item.material.id,
        measurementMainID: order.measurement_main_id || '',
        name: item.material.name,
        selected: true,
        quantity: item.ord_qty,
        maxQuantity: item.ord_qty,
        orderId: order.orderMain.docno,
        customerName: order.orderMain.user.fname,
        orderUniqueId: order.id,
        orderDetailId: item.id
      }));

      if (selectAll) {
        const filteredPrev = prev.filter(item => 
          !orderItems.some(orderItem => orderItem.id === item.id)
        );
        return [...filteredPrev, ...orderItems];
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

      const jobDetails = await Promise.all(selectedItems.map(async (item) => {
        const itemDetail = itemDetails[item.id] || {};
        
        let allImages: string[] = [];

        if (itemDetail.image) {
          const uploadedImageBase64 = await convertImageToBase64(URL.createObjectURL(itemDetail.image));
          allImages.push(uploadedImageBase64);
        }

        if (itemDetail.selectedImages?.length) {
          const selectedImagesBase64 = await convertImagesToBase64(itemDetail.selectedImages);
          allImages = [...allImages, ...selectedImagesBase64];
        }

        return {
          admsite_code: Number(selectedCode),
          order_details_id: Number(item.orderDetailId) || null,
          material_master_id: Number(item.materialId),
          measurement_main_id: Number(item.measurementMainID),
          image_url: allImages.length > 0 ? allImages : null,
          item_amt: itemDetail.makingCharge || 0,
          ord_qty: itemDetail.quantity || 1,
          trial_date: trialDate ? trialDate.toISOString().split('T')[0] : null,
          delivery_date: deliveryDate ? deliveryDate.toISOString().split('T')[0] : null
        };
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
      const admsiteCode = jobOrderDetails.length > 0 ? jobOrderDetails[0].admsite_code : null;

      const paymentData = {
        user_id: null,
        job_order_id: Number(selectedJobOrderForPayment.id),
        admsite_code: Number(admsiteCode),
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

  const openItemActionSidebar = (detail: JobOrderDetail) => {
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
    if (!selectedDetail || !selectedJobOrder) return;
    
    try {
      await JobOrderService.markJobOrderDelivered(
        selectedJobOrder.id,
        quantity,
      );
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Item marked as delivered',
        life: 3000
      });
      
      await fetchJobOrderDetails(selectedJobOrder.id);
      setItemActionSidebarVisible(false);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update delivery status',
        life: 3000
      });
    }
  };
  
  const handleCancelled = async () => {
    if (!selectedDetail || !selectedJobOrder) return;
    
    try {
      await JobOrderService.markJobOrderCancelled(
        selectedJobOrder.id,
        quantity
      );
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Item marked as cancelled',
        life: 3000
      });
      
      await fetchJobOrderDetails(selectedJobOrder.id);
      setItemActionSidebarVisible(false);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update cancellation status',
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
                    value={jobOrder.status?.status_name || "Pending"} 
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
              onChange={(e) => {
                setSelectedJobber(e.value);
                setSelectedCode(e.value);
              }}
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
        <div className="flex flex-column">
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
                          selectedItems.some(selected => selected.id === `${order.id}-${item.id}`)
                        )}
                        onChange={(e) => handleSelectAllInOrder(order, e.checked ?? false)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid">
                    {order.orderMain.orderDetails.map((item) => (
                      <div key={`${order.id}-${item.id}`} className="col-12">
                        <div className="flex align-items-center justify-content-between p-2 border-round surface-50">
                          <div className="flex align-items-center p-2">
                            <Checkbox 
                              inputId={`item-${order.id}-${item.id}`}
                              checked={selectedItems.some(selected => selected.id === `${order.id}-${item.id}`)}
                              onChange={() => handleItemSelection(order, item)}
                            />
                            <label htmlFor={`item-${order.id}-${item.id}`} className="ml-2">
                              {item.material.name}
                            </label>
                          </div>
                        
                          {selectedItems.some(selected => selected.id === `${order.id}-${item.id}`) && (
                            <Button 
                              icon="pi pi-plus"
                              onClick={() => handleAddItemClick(order, item)}
                              className="p-button-rounded p-button-text p-button-sm"
                              aria-label="Add item"
                              disabled={itemLoadingStates[`${order.id}-${item.id}`]}
                              loading={itemLoadingStates[`${order.id}-${item.id}`]}
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

            <div className="field mb-4">
              <label className="font-bold block mb-2 flex align-items-center">
                <i className="pi pi-calendar mr-2"></i>
                Trial Date
              </label>
              <Calendar
                  id="trialDate"
                  value={trialDate}
                  onChange={(e) => setTrialDate(e.value as Date)}
                  dateFormat="dd/mm/yy"
                  className="w-full"
                  showIcon
              />
            </div>

            <div className="field mb-4">
              <label className="font-bold block mb-2 flex align-items-center">
                <i className="pi pi-calendar mr-2"></i>
                Delivery Date
              </label>
              <Calendar
                id="deliveryDate"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.value as Date)}
                dateFormat="dd/mm/yy"
                className="w-full"
                showIcon
              />
            </div>

            <div className="field mb-4">
              <label className="font-bold block mb-2 flex align-items-center">
                <i className="pi pi-image mr-2"></i>
                Select Images from Order
              </label>
              
              <div className="border-1 surface-border border-round p-3">
                {currentlyEditingItem.orderUniqueId && (
                  <div className="flex flex-column gap-3">
                    {(() => {
                      const order = ordersList.find(o => o.id === currentlyEditingItem.orderUniqueId);
                      const images = order?.image_url 
                        ? (Array.isArray(order.image_url) ? order.image_url : [order.image_url])
                        : [];
                      
                      if (images.length === 0) {
                        return (
                          <div className="text-center p-4 surface-50 border-round">
                            <i className="pi pi-image text-2xl mb-2" />
                            <p className="m-0">No images available in this order</p>
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          <div className="flex justify-content-between align-items-center">
                            <span>Select All</span>
                            <Checkbox 
                              inputId="select-all-images"
                              checked={images.every(image =>
                                itemDetails[currentlyEditingItem.id]?.selectedImages?.includes(image)
                              )}
                              onChange={(e) => {
                                setItemDetails(prev => {
                                  const current = prev[currentlyEditingItem.id] || { quantity: 1, makingCharge: 0 };
                                  
                                  return {
                                    ...prev,
                                    [currentlyEditingItem.id]: {
                                      ...current,
                                      selectedImages: e.checked ? images : []
                                    }
                                  };
                                });
                              }}
                            />
                          </div>
                          
                          <div className="grid">
                            {images.map((imageUrl, index) => {                              
                              return (
                                <div key={index} className="col-6 md:col-4">
                                  <div className="border-1 surface-border border-round p-2 flex flex-column align-items-center">
                                    <img 
                                      src={imageUrl} 
                                      alt={`Order image ${index + 1}`}
                                      className="w-full mb-2 border-round cursor-pointer"
                                      style={{ 
                                        height: '100px',
                                        objectFit: 'cover',
                                        aspectRatio: '1/1'
                                      }}
                                      onClick={() => {
                                        setImages(images.map(img => ({
                                          itemImageSrc: img
                                        })));
                                        setActiveImageIndex(index);
                                        setImagePreviewVisible(true);
                                      }}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
                                      }}
                                    />
                                    <Checkbox 
                                      inputId={`order-image-${index}`}
                                      checked={itemDetails[currentlyEditingItem.id]?.selectedImages?.includes(imageUrl) || false}
                                      onChange={(e) => {
                                        setItemDetails(prev => {
                                          const current = prev[currentlyEditingItem.id] || { quantity: 1, makingCharge: 0 };
                                          const selectedImages = current.selectedImages || [];
                                          
                                          let updatedImages;
                                          if (e.checked) {
                                            updatedImages = [...selectedImages, imageUrl];
                                          } else {
                                            updatedImages = selectedImages.filter(img => img !== imageUrl);
                                          }
                                          
                                          return {
                                            ...prev,
                                            [currentlyEditingItem.id]: {
                                              ...current,
                                              selectedImages: updatedImages
                                            }
                                          };
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="field">
              <label className="font-bold block mb-2 flex align-items-center">
                <i className="pi pi-image mr-2"></i>
                Upload New Image
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
                    <span>Upload Image (max 1MB)</span>
                  </label>
                  <small className="text-500">Images larger than 1MB will be compressed automatically</small>
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
        visible={imagePreviewVisible} 
        onHide={() => setImagePreviewVisible(false)}
        style={{ width: '90vw', maxWidth: '800px' }}
        header="Image Preview"
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
              {selectedDetail?.orderDetail?.material.name || 'Item Actions'}
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

      <Dialog 
        header={`Order Details - ${selectedJobOrder?.docno || `JOB-${selectedJobOrder?.id}`}`} 
        visible={visible} 
        onHide={() => setVisible(false)}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className={isMaximized ? 'maximized-dialog' : ''}
        blockScroll
      >
        {loadingDetails ? (
          <div className="p-fluid my-5">
            <div className="grid mb-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="col-6">
                  <Skeleton width="100%" height="1.5rem" className="mb-2" />
                  <Skeleton width="80%" height="1rem" />
                </div>
              ))}
            </div>
            
            <Divider />
            
            <h5 className="m-0 mb-3">Job Order Details</h5>
            
            {[...Array(2)].map((_, i) => (
              <div key={i} className="mb-4 surface-50 p-3 border-round">
                <div className="grid">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className={j < 2 ? 'col-6' : j < 6 ? 'col-6 mt-3' : 'col-12 mt-3'}>
                      <Skeleton width="100%" height="1.5rem" className="mb-2" />
                      <Skeleton width="80%" height="1rem" />
                    </div>
                  ))}
                  <div className="col-12 mt-3">
                    <Skeleton width="120px" height="38px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          selectedJobOrder && (
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
                      value={selectedJobOrder.status?.status_name || "Pending"}
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
                        <p className="m-0 font-medium">{detail.orderDetail?.material.name}</p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="field">
                        <label>Sales Order No</label>
                        <p className="m-0 font-medium">{detail.orderDetail?.measurementMain.docno}</p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="field">
                        <label>Customer Name</label>
                        <p className="m-0 font-medium">{detail.orderDetail?.measurementMain.user.fname}</p>
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
                        <p className="m-0 font-medium">{detail.item_amt}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="field">
                        <label>Notes</label>
                        <p className="m-0 font-medium">{detail?.desc1 || 'No notes'}</p>
                      </div>
                    </div>
                    
                    {detail.image_url && detail.image_url.length > 0 && (
                      <div className="col-12 mt-2">
                        <Button 
                          label={`View Images (${detail.image_url.length})`} 
                          icon="pi pi-image" 
                          onClick={() => handleImagePreview(detail.image_url)}
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
                    <div className="col-12 mt-2">
                      <Button 
                        label="Update Status" 
                        icon="pi pi-pencil" 
                        onClick={() => openItemActionSidebar(detail)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
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
          style={{ maxWidth: '100%' }}
        />
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

export default JobOrder;