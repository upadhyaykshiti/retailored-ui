/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

type Measurement = 
  'Length' | 'Chest' | 'Shoulder' | 'Waist' | 'Hip' | 
  'Sleeve' | 'Neck' | 'Armhole' | 'Bicep' | 'Bottom Width';

type Status = 'active' | 'inactive';

interface Garment {
  id: number;
  name: string;
  measurements: Measurement[];
  status: Status;
}

interface StatusOption {
  label: string;
  value: Status;
  icon: string;
}

const measurementOptions: Measurement[] = [
  'Length', 'Chest', 'Shoulder', 'Waist', 'Hip', 
  'Sleeve', 'Neck', 'Armhole', 'Bicep', 'Bottom Width'
];

const statusOptions: StatusOption[] = [
  { label: 'Active', value: 'active', icon: 'pi pi-check-circle' },
  { label: 'Inactive', value: 'inactive', icon: 'pi pi-times-circle' }
];

const initialGarments: Garment[] = [
  { id: 1, name: 'Kurta Pajama', measurements: ['Length', 'Chest', 'Shoulder'], status: 'active' },
  { id: 2, name: 'Pajama', measurements: ['Waist', 'Length', 'Hip'], status: 'active' },
  { id: 3, name: 'Shirt', measurements: ['Chest', 'Length', 'Sleeve'], status: 'inactive' }
];

const Garments = () => {
  const [garments, setGarments] = useState<Garment[]>(initialGarments);
  const [isClient, setIsClient] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);
  const [currentGarment, setCurrentGarment] = useState<Garment>({
    id: 0,
    name: '',
    measurements: [],
    status: 'active'
  });

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('garments');
    if (saved) {
      setGarments(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('garments', JSON.stringify(garments));
    }
  }, [garments, isClient]);

  const handleAdd = () => {
    setCurrentGarment({
      id: 0,
      name: '',
      measurements: [],
      status: 'active'
    });
    setEditMode(false);
    setShowDialog(true);
  };

  const handleEdit = (garment: Garment) => {
    setCurrentGarment({ ...garment });
    setEditMode(true);
    setShowDialog(true);
  };

  const handleSave = () => {
    let updatedGarments: Garment[];
    
    if (editMode) {
      updatedGarments = garments.map(g => 
        g.id === currentGarment.id ? currentGarment : g
      );
    } else {
      const newId = garments.length > 0 
        ? Math.max(...garments.map(g => g.id)) + 1 
        : 1;
        
      updatedGarments = [
        ...garments, 
        {
          ...currentGarment,
          id: newId
        }
      ];
    }
  
    setGarments(updatedGarments);
    setShowDialog(false);
  };

  const confirmStatusChange = (garmentId: number, newStatus: Status) => {
    confirmDialog({
      message: `Are you sure you want to mark this garment as ${newStatus}?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-info-circle',
      accept: () => {
        setGarments(garments.map(g => 
          g.id === garmentId ? { ...g, status: newStatus } : g
        ));
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
        <h2 className="text-2xl m-0">Garment Types</h2>
        <Button 
          label="Add Garment" 
          icon="pi pi-plus" 
          onClick={handleAdd}
          className="w-full md:w-auto"
          size="small"
        />
      </div>

      <div className="flex flex-wrap gap-3 justify-content-center lg:justify-content-start">
        {garments.map((garment) => (
          <Card key={garment.id} className="flex flex-column w-full sm:w-20rem lg:w-22rem transition-all transition-duration-200 hover:shadow-4">
            <div className="flex justify-content-between align-items-start">
              <h3 className="text-xl m-0">{garment.name}</h3>
              <Tag 
                value={garment.status === 'active' ? 'Active' : 'Inactive'}
                severity={garment.status === 'active' ? 'success' : 'danger'}
                className="align-self-start"
              />
            </div>

            <Divider className="my-2" />

            <div className="flex flex-wrap gap-2 mt-2">
              {garment.measurements.map((m, i) => (
                <Tag key={i} value={m} />
              ))}
            </div>

            <div className="flex justify-content-end gap-1">
              <Button 
                icon="pi pi-pencil" 
                rounded 
                text 
                onClick={() => handleEdit(garment)}
                severity="secondary"
              />
              <Button 
                icon={garment.status === 'active' ? 'pi pi-trash' : 'pi pi-replay'} 
                rounded 
                text 
                severity={garment.status === 'active' ? 'danger' : 'warning'}
                onClick={() => confirmStatusChange(garment.id, garment.status === 'active' ? 'inactive' : 'active')}
              />
            </div>
          </Card>
        ))}
      </div>

      <Dialog 
        visible={showDialog} 
        onHide={() => setShowDialog(false)}
        header={editMode ? "Edit Garment" : "Add New Garment"}
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className="w-full"
        blockScroll
      >
        <div className="flex flex-column gap-3">
          <div className="field">
            <label htmlFor="garmentName">Garment Name</label>
            <InputText
              id="garmentName"
              value={currentGarment.name}
              onChange={(e) => setCurrentGarment({
                ...currentGarment,
                name: e.target.value
              })}
              placeholder="e.g., Kurta, Shirt, etc."
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="measurements">Select Measurements</label>
            <MultiSelect
              id="measurements"
              value={currentGarment.measurements}
              options={measurementOptions}
              onChange={(e: MultiSelectChangeEvent) => setCurrentGarment({
                ...currentGarment,
                measurements: e.value as Measurement[]
              })}
              placeholder="Select Measurements"
              display="chip"
              filter
              className="w-full"
              maxSelectedLabels={3}
              selectedItemsLabel="{0} measurements selected"
            />
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <Dropdown
              id="status"
              value={currentGarment.status}
              options={statusOptions}
              onChange={(e: DropdownChangeEvent) => setCurrentGarment({
                ...currentGarment,
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
              onClick={() => setShowDialog(false)}
              className="p-button-text"
            />
            <Button 
              label="Save" 
              icon="pi pi-check" 
              onClick={handleSave}
              disabled={!currentGarment.name || currentGarment.measurements.length === 0}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Garments;