/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { UserService } from '@/demo/service/user.service';
import { Skeleton } from 'primereact/skeleton';
import { useInfiniteObserver } from '@/demo/hooks/useInfiniteObserver';

interface Customer {
    id: number;
    fname: string;
    lname: string;
    email: string;
    mobileNumber: string;
    dob: string;
    homeAddress: string;
    admsite_code: string;
}

interface Order {
    id: number;
    trial_date: string;
    delivery_date: string;
    item_amt: number;
    ord_qty: number;
    delivered_qty: number;
    cancelled_qty: number;
    inProcess_qty: number;
    itemRef: string;
    materialName: string;
    statusName: string;
}

interface OrdersResponse {
    data: Order[];
    paginatorInfo: {
        hasMorePages: boolean;
        currentPage: number;
        pageSize: number;
        totalItems: number;
    };
}

const CustomerDetails = () => {
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    useEffect(() => {
        if (customer?.admsite_code && typeof window !== 'undefined') {
            localStorage.setItem('currentCustomerAdmsite', customer.admsite_code);
        }
    }, [customer?.admsite_code]);

    const fetchCustomerOrders = async (admsiteCode: string, isLoadMore = false, pageNum = 1) => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const response: OrdersResponse = await UserService.getCustomerOrders(
                admsiteCode,
                5,
                pageNum
            );

            setHasMorePages(response.paginatorInfo.hasMorePages);

            const formattedOrders: Order[] = response.data.map((od: any) => ({
                id: od.id,
                trial_date: od.trial_date,
                delivery_date: od.delivery_date,
                item_amt: parseFloat(od.item_amt),
                ord_qty: od.ord_qty,
                delivered_qty: od.delivered_qty,
                cancelled_qty: od.cancelled_qty,
                inProcess_qty: od.inProcess_qty,
                itemRef: od.item_ref,
                materialName: od.material?.name || 'N/A',
                statusName: od.orderStatus?.status_name || 'Pending',
            }));

            if (isLoadMore) {
                setOrders(prev => [...prev, ...formattedOrders]);
                setPage(prev => prev + 1);
            } else {
                setOrders(formattedOrders);
                setPage(2);
            }
        } catch (err) {
            console.error('Failed to fetch customer orders:', err);
        } finally {
            if (isLoadMore) {
                setIsLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const fetchCustomerData = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const customerInfo = await UserService.getCustomerInfo(id);
                setCustomer(customerInfo);

                const admsiteCode = typeof window !== 'undefined' 
                    ? localStorage.getItem('currentCustomerAdmsite') || customerInfo.admsite_code
                    : customerInfo.admsite_code;

                if (!admsiteCode) {
                    console.warn("Missing admsite_code for customer.");
                    return;
                }

                await fetchCustomerOrders(admsiteCode, false, 1);
            } catch (err) {
                console.error('Failed to fetch customer data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerData();

        return () => {
        setCustomer(null);
        setOrders([]);
        setPage(1);
        setHasMorePages(true);
        localStorage.removeItem('currentCustomerAdmsite');
      };
    }, [id]);

    useInfiniteObserver({
        targetRef: observerTarget,
        hasMorePages,
        isLoading: isLoadingMore,
        onIntersect: () => {
            if (hasMorePages && !isLoadingMore) {
                const admsiteCode = customer?.admsite_code || 
                    (typeof window !== 'undefined' ? localStorage.getItem('currentCustomerAdmsite') : null);
                
                if (admsiteCode) {
                    fetchCustomerOrders(admsiteCode, true, page);
                }
            }
        },
        deps: [hasMorePages, customer?.admsite_code, page, isLoadingMore]
    });

    return (
        <div className="grid p-2">
            <div className="col-12 flex align-items-center gap-2">
                <Button icon="pi pi-arrow-left" severity="secondary" onClick={() => router.back()} className="p-button-text" />
                <h2 className="m-0 text-2xl font-500">Customer Details</h2>
            </div>
            <div className="col-12 md:col-3">
                <Card className="h-full">
                    {loading ? (
                        <div className="flex flex-column gap-4">
                            <div className="flex flex-column align-items-center gap-3 mb-4">
                                <Skeleton shape="circle" size="5rem" />
                                <Skeleton width="70%" height="1.75rem" />
                            </div>

                            <Skeleton width="100%" height="1px" className="bg-gray-300" />

                            <div className="flex flex-column gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex align-items-center gap-3">
                                <Skeleton width="80%" height="1.25rem" />
                                </div>
                            ))}
                        </div>
                    </div>
                    ) : (
                        <>
                            <div className="flex flex-column align-items-center gap-3 mb-2">
                                <Avatar 
                                    label={customer?.fname?.charAt(0).toUpperCase() || 'U'} 
                                    size="xlarge" 
                                    shape="circle" 
                                    className="shadow-4 text-xxl font-semibold bg-primary text-white" 
                                />
                                <span className="text-2xl font-bold">
                                    {customer ? `${customer.fname}${customer.lname ? ' ' + customer.lname : ''}` : ''}
                                </span>
                            </div>

                            <Divider />

                            <div className="flex flex-column gap-3">
                                <div className="flex align-items-center gap-3">
                                    <i className="pi pi-phone text-500" style={{ fontSize: '1.2rem' }}></i>
                                    <div>{customer?.mobileNumber || 'Not Available'}</div>
                                </div>

                                <div className="flex align-items-center gap-3">
                                    <i className="pi pi-envelope text-500" style={{ fontSize: '1.2rem' }}></i>
                                    <div>{customer?.email || 'Not Available'}</div>
                                </div>

                                <div className="flex align-items-center gap-3">
                                    <i className="pi pi-calendar text-500" style={{ fontSize: '1.2rem' }}></i>
                                    <div>{customer?.dob || 'Not Available'}</div>
                                </div>

                                <div className="flex align-items-center gap-3">
                                    <i className="pi pi-map-marker text-500" style={{ fontSize: '1.2rem' }}></i>
                                    <div>{customer?.homeAddress || 'Not Available'}</div>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            <div className="col-12 md:col-9">
                <Card>
                    <div className="flex align-items-center justify-content-between mb-4">
                        <h2 className="m-0 text-2xl font-500">Orders</h2>
                    </div>

                    <div className="grid">
                        {loading ? [...Array(3)].map((_, i) => (
                            <div key={i} className="col-12 mb-3">
                                <Card className="shadow-1">
                                    <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between align-items-center">
                                        <div>
                                        <Skeleton width="6rem" height="1.25rem" />
                                        <Skeleton
                                            width="4rem"
                                            height="1rem"
                                            style={{ marginTop: '0.25rem' }}
                                        />
                                        </div>
                                        <Skeleton
                                        width="5rem"
                                        height="1.5rem"
                                        style={{ borderRadius: '12px' }}
                                        />
                                    </div>

                                    <Divider className="my-2" />

                                    <div className="flex flex-column gap-1">
                                        {[...Array(7)].map((__, idx) => (
                                        <div key={idx} className="flex justify-content-between">
                                            <Skeleton width="20%" height="1rem" />
                                            <Skeleton width="25%" height="1rem" />
                                        </div>
                                        ))}
                                    </div>
                                    </div>
                                </Card>
                            </div>
                        )) : orders.map((order) => (
                            <div key={order.id} className="col-12 mb-3">
                                <Card className="shadow-1 hover:shadow-3 transition-shadow transition-duration-200">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between align-items-center">
                                            <div>
                                                <span className="font-bold block">Order #{order.id}</span>
                                                <span className="text-sm text-500">{order.itemRef}</span>
                                            </div>
                                            <Tag value={order.statusName} severity={order.statusName === 'Completed' ? 'success' : order.statusName === 'In Progress' ? 'info' : 'warning'} />
                                        </div>

                                        <Divider className="my-2" />

                                        <div className="flex flex-column gap-1">
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Item</span>
                                                <span>{order.materialName}</span>
                                            </div>

                                            <div className="flex justify-content-between">
                                                <span className="text-500">Trial Date:</span>
                                                <span>{order.trial_date || '-'}</span>
                                            </div>

                                            <div className="flex justify-content-between">
                                                <span className="text-500">Delivery Date:</span>
                                                <span>{order.delivery_date || '-'}</span>
                                            </div>

                                            <div className="flex justify-content-between">
                                                <span className="text-500">Delivered:</span>
                                                <span>{order.delivered_qty || 0}</span>
                                            </div>

                                            <div className="flex justify-content-between">
                                                <span className="text-500">Cancelled:</span>
                                                <span>{order.cancelled_qty || 0}</span>
                                            </div>

                                            <div className="flex justify-content-between">
                                                <span className="text-500">Qty:</span>
                                                <span>{order.ord_qty || 0}</span>
                                            </div>

                                            <div className="flex justify-content-between">
                                                <span className="text-500">Amount:</span>
                                                <span className="font-bold text-primary">₹{order.item_amt.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>

                    <div ref={observerTarget} className="col-12">
                        {isLoadingMore && (
                            <div className="flex justify-content-center p-4">
                                <i className="pi pi-spinner pi-spin text-2xl"></i>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CustomerDetails;
