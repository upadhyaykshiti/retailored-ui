/* eslint-disable @next/next/no-img-element */
'use client';
import { Chart } from 'primereact/chart';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from '@/layout/context/layoutcontext'; 
import { ChartData, ChartOptions } from 'chart.js';

const Dashboard = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const [barOptions, setBarOptions] = useState<ChartOptions>({});

    const thisWeeksDelivery = 42;
    const delayedJobOrders = 8;
    const pendingOrders = 23;
    const jobOrders = 15;
    const customers = ['Nishant Kumar', 'Rahul Sharma', 'Priya Mehta', 'Amit Pramal'];
    const jobbers = ['Tailor Master', 'Stitch Well', 'Precision Tailors', 'Quick Stitch'];

    const deliveryData: ChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
            {
                label: 'This Week Deliveries',
                data: [5, 7, 8, 6, 10, 6],
                fill: false,
                backgroundColor: '#2f4860',
                borderColor: '#2f4860',
                tension: 0.4
            },
            {
                label: 'Last Week Deliveries',
                data: [4, 6, 5, 7, 8, 5],
                fill: false,
                backgroundColor: '#00bb7e',
                borderColor: '#00bb7e',
                tension: 0.4
            }
        ]
    };

    const ordersData: ChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Job Orders',
                backgroundColor: '#36A2EB',
                data: [12, 15, 10, 18, 14, 20]
            },
            {
                label: 'Sales Orders',
                backgroundColor: '#FFCE56',
                data: [8, 10, 12, 15, 11, 13]
            }
        ]
    };

    const applyLightTheme = () => {
        const lineOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };

        const barOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };

        setLineOptions(lineOptions);
        setBarOptions(barOptions);
    };

    const applyDarkTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                }
            }
        };

        const barOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                }
            }
        };

        setLineOptions(lineOptions);
        setBarOptions(barOptions);
    };

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);

    return (
        <div className="grid">
            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">This Week&apos;s Delivery (Qty)</span>
                            <div className="text-900 font-medium text-xl">{thisWeeksDelivery}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-check-circle text-green-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Delayed Job Orders (Qty)</span>
                            <div className="text-900 font-medium text-xl">{delayedJobOrders}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-exclamation-triangle text-red-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Pending Orders</span>
                            <div className="text-900 font-medium text-xl">{pendingOrders}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-clock text-orange-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Job Orders</span>
                            <div className="text-900 font-medium text-xl">{jobOrders}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-briefcase text-blue-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Customers This Week</span>
                            <div className="text-900 font-medium text-sm">
                                {customers.join(', ')}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-purple-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Jobbers This Week</span>
                            <div className="text-900 font-medium text-sm">
                                {jobbers.join(', ')}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-wrench text-cyan-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Weekly Deliveries</h5>
                    <Chart type="line" data={deliveryData} options={lineOptions} />
                </div>
            </div>
            
            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Orders Overview</h5>
                    <Chart type="bar" data={ordersData} options={barOptions} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;