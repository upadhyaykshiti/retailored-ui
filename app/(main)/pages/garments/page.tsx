/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Skeleton } from 'primereact/skeleton';
import { InputText } from 'primereact/inputtext';
import { MaterialService } from '@/demo/service/material.service';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import FullPageLoader from '@/demo/components/FullPageLoader';
import { Toast } from 'primereact/toast';
import { useInfiniteObserver } from '@/demo/hooks/useInfiniteObserver';
import { useDebounce } from 'use-debounce';
import { Demo } from '@/types';

type Measurement = {
  id?: number;
  measurement_name: string;
  data_type: 'text' | 'number';
  seq: number;
};

type Ext = 'N' | 'Y';

interface Garment {
  id: number;
  name: string;
  img_url: string;
  measurements: Measurement[];
  ext: Ext;
}

interface StatusOption {
  label: string;
  value: Ext;
  icon: string;
}

const statusOptions: StatusOption[] = [
  { label: 'Active', value: 'N', icon: 'pi pi-check-circle' },
  { label: 'Inactive', value: 'Y', icon: 'pi pi-times-circle' }
];

const Garments = () => {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [isMaximized, setIsMaximized] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMeasurementIndex, setEditMeasurementIndex] = useState<number | null>(null);
  const [paginatorInfo, setPaginatorInfo] = useState<Demo.PaginatorInfo | null>(null);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const toast = useRef<Toast>(null);
  const [currentGarment, setCurrentGarment] = useState<Garment>({
    id: 0,
    name: '',
    img_url: '',
    measurements: [],
    ext: 'N'
  });
  const [newMeasurement, setNewMeasurement] = useState<Omit<Measurement, 'seq'>>({
    id: 0,
    measurement_name: '',
    data_type: 'number',
  });
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchMaterials = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else if (!searchTerm) {
        setIsInitialLoading(true);
      }

      const { data, paginatorInfo } = await MaterialService.getMaterialMasters(
        debouncedSearchTerm,
        3,
        loadMore ? page + 1 : 1
      );

      const mappedGarments = data.map((material: any) => ({
        id: Number(material.id),
        name: material.name,
        img_url: material.img_url,
        measurements: material.measurements.map((m: Measurement) => ({
          id: Number(m.id),
          measurement_name: m.measurement_name,
          data_type: m.data_type,
          seq: m.seq ?? 0
        })),
        ext: material.ext as Ext
      }));

      setGarments(prev => loadMore ? [...prev, ...mappedGarments] : mappedGarments);
      setPaginatorInfo(paginatorInfo);
      setHasMorePages(paginatorInfo.hasMorePages);
      if (loadMore) setPage(prev => prev + 1);
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to fetch products. Please try again.');
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch products',
        life: 3000
      });
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
      setListLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchMaterials();
  }, [debouncedSearchTerm]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchMaterials();
    }
  };

  useInfiniteObserver({
    targetRef: observerTarget,
    hasMorePages,
    isLoading: isLoadingMore,
    onIntersect: () => {
      if (hasMorePages) {
        fetchMaterials(true);
      }
    },
    deps: [hasMorePages, searchTerm]
  });

  const handleAdd = () => {
    setCurrentGarment({
      id: 0,
      name: '',
      img_url: '',
      measurements: [],
      ext: 'N'
    });
    setNewMeasurement({
      measurement_name: '',
      data_type: 'number'
    });
    setEditMode(false);
    setShowDialog(true);
  };

  const handleEdit = (garment: Garment) => {
    setCurrentGarment({ ...garment });
    setEditMode(true);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!currentGarment.name) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Garment name is required', life: 3000 });
      return;
    }

    if (currentGarment.measurements.length === 0) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'At least one measurement is required', life: 3000 });
      return;
    }

    setListLoading(true);
    try {
      if (editMode) {
        const payload = {
          name: currentGarment.name,
          ext: currentGarment.ext,
          measurements: currentGarment.measurements
        };
        console.log("Update Payload:", payload);
  
        await MaterialService.updateMaterialWithMeasurements(String(currentGarment.id), payload);
        toast.current?.show({ severity: 'success', summary: 'Updated', detail: 'Garment updated successfully', life: 3000 });
      } else {
        const payload = {
          name: currentGarment.name,
          img_url: 'null',
          material_type: 'F',
          isSaleable: 'Y',
          wsp: 0,
          mrp: 0,
          vendor_id: 2,
          ext: currentGarment.ext,
          measurements: currentGarment.measurements
        };
        console.log("🆕 Create Payload:", payload);
  
        await MaterialService.createMaterialWithMeasurements(payload);
        toast.current?.show({ severity: 'success', summary: 'Created', detail: 'Garment created successfully', life: 3000 });
      }  

      setShowDialog(false);
      fetchMaterials();
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Failed to save garment', life: 3000 });
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const addMeasurement = () => {
    const trimmedName = newMeasurement.measurement_name.trim();
    const lowerCaseName = trimmedName.toLowerCase();
    const type = newMeasurement.data_type;
  
    if (!trimmedName) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Missing Name',
        detail: 'Measurement name is required.',
        life: 3000,
      });
      return;
    }
  
    const isDuplicate = currentGarment.measurements?.some(
      (m) =>
        m.measurement_name.trim().toLowerCase() === lowerCaseName &&
        m.data_type === type
    );
  
    if (isDuplicate) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Duplicate Measurement',
        detail: 'This measurement name with the same data type already exists.',
        life: 3000,
      });
      return;
    }
  
    setCurrentGarment((prev) => ({
      ...prev,
      measurements: [
        ...(prev.measurements || []),
        {
          ...newMeasurement,
          measurement_name: trimmedName,
          seq: (prev.measurements?.length || 0) + 1,
        },
      ],
    }));
  
    setNewMeasurement({ measurement_name: '', data_type: 'number' });
  };

  const updateMeasurement = () => {
    if (
      editMeasurementIndex !== null &&
      newMeasurement.measurement_name &&
      newMeasurement.data_type
    ) {
      const updated = [...(currentGarment.measurements || [])];
  
      const originalSeq = updated[editMeasurementIndex].seq;
  
      updated[editMeasurementIndex] = {
        ...newMeasurement,
        seq: originalSeq
      };
  
      setCurrentGarment(prev => ({
        ...prev,
        measurements: updated
      }));
  
      setNewMeasurement({ measurement_name: '', data_type: 'text' } as Measurement);
      setEditMeasurementIndex(null);
    }
  };  

  const removeMeasurement = (index: number) => {
    const updatedMeasurements = [...currentGarment.measurements];
    updatedMeasurements.splice(index, 1);
    
    const reorderedMeasurements = updatedMeasurements.map((m, i) => ({
      ...m,
      seq: i + 1
    }));

    setCurrentGarment({
      ...currentGarment,
      measurements: reorderedMeasurements
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(currentGarment.measurements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedWithSeq = items.map((item, index) => ({
      ...item,
      seq: index + 1
    }));

    setCurrentGarment({
      ...currentGarment,
      measurements: reorderedWithSeq
    });
  };

  const confirmStatusChange = (garmentId: number, newStatus: Ext) => {
    confirmDialog({
      message: `Are you sure you want to mark this garment as ${newStatus === 'N' ? 'Active' : 'Inactive'}?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-info-circle',
      accept: () => {
        setGarments(garments.map(g => 
          g.id === garmentId ? { ...g, ext: newStatus } : g
        ));
      }
    });
  };

  const statusItemTemplate = (option: StatusOption | null | undefined) => {
    if (!option) return null;
  
    return (
      <div className="flex align-items-center gap-2">
        <i className={`${option.icon} ${option.value === 'N' ? 'text-green-500' : 'text-red-500'}`}></i>
        <span>{option.label}</span>
      </div>
    );
  };

  if (isInitialLoading || error) {
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
              <div className="flex justify-content-between align-items-start mb-2">
                <Skeleton width="10rem" height="1.75rem" />
                <Skeleton width="5rem" height="1.5rem" />
              </div>
  
              <Skeleton width="100%" height="1px" className="my-2" />
  
              <div className="flex flex-wrap gap-2 mt-1">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} width="5rem" height="1.5rem" borderRadius="1rem" />
                ))}
              </div>
  
              <div className="flex justify-content-end gap-2 mt-3">
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
        <Toast ref={toast} />
        
        <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
          <h2 className="text-2xl m-0">Products</h2>
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
            label="Add Garment" 
            icon="pi pi-plus" 
            onClick={handleAdd}
            className="w-full md:w-auto"
            size="small"
          />
        </div>

        <div className="flex flex-wrap gap-3 justify-content-start">
          {garments.length > 0 ? (
            <>
              {garments.map((garment) => (
                <Card key={garment.id} className="flex flex-column w-full sm:w-20rem lg:w-22rem transition-all transition-duration-200 hover:shadow-4">
                  <div className="flex justify-content-between align-items-start">
                    <h3 className="text-xl m-0">{garment.name}</h3>
                    <Tag 
                      value={garment.ext === 'N' ? 'Active' : 'Inactive'}
                      severity={garment.ext === 'N' ? 'success' : 'danger'}
                      className="align-self-start"
                    />
                  </div>

                  <Divider className="my-2" />

                  <div className="flex flex-wrap gap-2">
                    {garment.measurements
                      ?.sort((a, b) => a.seq - b.seq)
                      .map((measurement, index) => (
                        <Tag 
                          key={index}
                          value={measurement.measurement_name}
                          className="capitalize"
                        />
                    ))}
                  </div>

                  <div className="flex justify-content-end gap-1 mt-3">
                    <Button 
                      icon="pi pi-pencil" 
                      rounded 
                      text 
                      onClick={() => handleEdit(garment)}
                      severity="secondary"
                    />
                    <Button 
                      icon={garment.ext === 'N' ? 'pi pi-trash' : 'pi pi-replay'} 
                      rounded 
                      text 
                      severity={garment.ext === 'N' ? 'danger' : 'warning'}
                      onClick={() => confirmStatusChange(garment.id, garment.ext === 'N' ? 'Y' : 'N')}
                    />
                  </div>
                </Card>
              ))}
              <div ref={observerTarget} className="w-full flex justify-content-center p-3">
                {isLoadingMore && (
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-spinner pi-spin" />
                    <span>Loading more data...</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full p-4 text-center surface-100 border-round">
              <i className="pi pi-search text-4xl mb-2" />
              <h3>No garments found</h3>
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
          visible={showDialog} 
          onHide={() => setShowDialog(false)}
          header={editMode ? "Edit Garment" : "Add New Garment"}
          maximized={isMaximized}
          onMaximize={(e) => setIsMaximized(e.maximized)}
          className={isMaximized ? 'maximized-dialog' : ''}
          blockScroll
        >
          <div className="flex flex-column gap-3 mt-3">
            <div className="field">
              <label htmlFor="garmentName">Garment Name</label>
              <InputText
                id="garmentName"
                value={currentGarment.name}
                onChange={(e) => setCurrentGarment({
                  ...currentGarment,
                  name: e.target.value
                })}
                placeholder="Enter garment name"
                className="w-full"
              />
            </div>

            <div className="field">
              <label>Add Measurement</label>
              <div className="flex gap-2">
                <div className="flex-1 flex gap-2" style={{ width: '80%' }}>
                  <InputText
                    value={newMeasurement.measurement_name}
                    onChange={(e) => setNewMeasurement({
                      ...newMeasurement,
                      measurement_name: e.target.value
                    })}
                    placeholder="Name"
                    className="w-6"
                  />
                  <Dropdown
                    value={newMeasurement.data_type}
                    options={[
                      { label: 'Text', value: 'text' },
                      { label: 'Number', value: 'number' }
                    ]}
                    onChange={(e) => setNewMeasurement({
                      ...newMeasurement,
                      data_type: e.value
                    })}
                    optionLabel="label"
                    optionValue="value"
                    className="w-6"
                  />
                </div>
                <Button 
                  icon={editMeasurementIndex !== null ? "pi pi-check" : "pi pi-plus"} 
                  onClick={editMeasurementIndex !== null ? updateMeasurement : addMeasurement}
                  className="w-2"
                  style={{ minWidth: 'auto' }}
                  />
              </div>
            </div>

            <div className="field">
              <label>Measurements</label>
              {currentGarment.measurements?.length === 0 ? (
                <div className="p-3 border-round surface-100 text-center">
                  No measurements added yet
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="measurements">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-column gap-3"
                      >
                        {currentGarment.measurements.map((measurement, index) => (
                          <Draggable key={index} draggableId={`measurement-${index}`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-3 border-round flex align-items-center gap-3 transition-all transition-duration-200 ${
                                  snapshot.isDragging 
                                    ? 'bg-gray-200 shadow-2' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                <div 
                                  {...provided.dragHandleProps}
                                  className="flex flex-column gap-1 cursor-move text-gray-600"
                                >
                                  <i className="pi pi-bars"></i>
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium capitalize">{measurement.measurement_name}</span>
                                  <small className="block text-color-secondary">({measurement.data_type})</small>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    icon="pi pi-pencil" 
                                    rounded 
                                    text 
                                    severity="info"
                                    className="p-button-sm"
                                    onClick={() => {
                                      setNewMeasurement(measurement);
                                      setEditMeasurementIndex(index);
                                    }}
                                  />
                                  <Button 
                                    icon="pi pi-trash" 
                                    rounded 
                                    text 
                                    severity="danger"
                                    onClick={() => removeMeasurement(index)}
                                    className="p-button-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            <div className="field">
              <label htmlFor="status">Status</label>
              <Dropdown
                id="status"
                value={currentGarment.ext}
                options={statusOptions}
                onChange={(e: DropdownChangeEvent) => setCurrentGarment({
                  ...currentGarment,
                  ext: e.value
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
                onClick={() => setShowDialog(false)}
                className="p-button-text"
              />
              <Button 
                label="Save" 
                icon="pi pi-check" 
                onClick={handleSave}
                disabled={!currentGarment.name || currentGarment.measurements?.length === 0}
              />
            </div>
          </div>
        </Dialog>
        <ConfirmDialog />
      </div>
    </>
  );
};

export default Garments;