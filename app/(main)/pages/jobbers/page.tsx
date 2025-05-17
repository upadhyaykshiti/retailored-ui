/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { ToggleButton } from 'primereact/togglebutton';
import { Chips } from 'primereact/chips';
import { useState } from 'react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

type JobberStatus = 'active' | 'inactive';
type SkillLevel = 'beginner' | 'intermediate' | 'expert';

interface Jobber {
  id: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  skills: string[];
  status: JobberStatus;
}

const Jobbers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobbers, setJobbers] = useState<Jobber[]>([
    { 
      id: 1, 
      name: 'Rajesh Tailor', 
      mobile: '+91 9876543210', 
      email: 'rajesh@example.com',
      address: '123, Tailor Street, Mumbai',
      skills: ['Stitching', 'Alterations', 'Embroidery'],
      status: 'active',
    },
    { 
      id: 2, 
      name: 'Mohan Stitcher', 
      mobile: '+91 8765432109', 
      email: 'mohan@example.com',
      address: '456, Fabric Lane, Delhi',
      skills: ['Stitching', 'Repairs'],
      status: 'active',
    },
    { 
      id: 3, 
      name: 'Sunil Artisan', 
      mobile: '+91 7654321098', 
      email: 'sunil@example.com',
      address: '789, Craft Road, Bangalore',
      skills: ['Hand Embroidery', 'Zari Work'],
      status: 'inactive',
    },
  ]);

  const [visible, setVisible] = useState(false);
  const [currentJobber, setCurrentJobber] = useState<Jobber | null>(null);
  const [isMaximized, setIsMaximized] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const showAddDialog = () => {
    setCurrentJobber({
      id: jobbers.length + 1,
      name: '',
      mobile: '',
      email: '',
      address: '',
      skills: [],
      status: 'active',
    });
    setIsEditMode(false);
    setVisible(true);
  };

  const showEditDialog = (jobber: Jobber) => {
    setCurrentJobber({ ...jobber });
    setIsEditMode(true);
    setVisible(true);
  };

  const handleSave = () => {
    if (!currentJobber) return;

    if (isEditMode) {
      setJobbers(jobbers.map(j => j.id === currentJobber.id ? currentJobber : j));
    } else {
      setJobbers([...jobbers, currentJobber]);
    }
    setVisible(false);
  };

  const toggleJobberStatus = (jobberId: number) => {
    setJobbers(jobbers.map(jobber => 
      jobber.id === jobberId 
        ? { ...jobber, status: jobber.status === 'active' ? 'inactive' : 'active' } 
        : jobber
    ));
  };

  const confirmStatusChange = (jobberId: number) => {
    const jobber = jobbers.find(j => j.id === jobberId);
    const isActive = jobber?.status === 'active';
    
    confirmDialog({
      message: `Are you sure you want to mark this jobber as ${isActive ? 'inactive' : 'active'}?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-info-circle',
      acceptClassName: isActive ? 'p-button-danger' : 'p-button-success',
      accept: () => toggleJobberStatus(jobberId)
    });
  };

  const filteredJobbers = jobbers.filter(jobber => 
    jobber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jobber.mobile.includes(searchTerm) ||
    jobber.skills.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const footerContent = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
      <Button label="Save" icon="pi pi-check" onClick={handleSave} autoFocus />
    </div>
  );

  const getSkillLevelSeverity = (level: SkillLevel) => {
    switch(level) {
      case 'beginner': return 'info';
      case 'intermediate': return 'warning';
      case 'expert': return 'success';
      default: return null;
    }
  };

  return (
    <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <ConfirmDialog />
      
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0">Jobbers</h2>
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
          label="Add Jobber" 
          icon="pi pi-plus" 
          onClick={showAddDialog}
          className="w-full md:w-auto"
          size="small"
        />
      </div>

      <div className="flex flex-wrap gap-3 lg:justify-content-start">
        {filteredJobbers.length > 0 ? (
          filteredJobbers.map((jobber) => (
            <Card 
              key={jobber.id} 
              className="flex flex-column w-full sm:w-20rem lg:w-22rem transition-all transition-duration-200 hover:shadow-4 cursor-pointer"
            >

              <div className="flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="text-xl m-0">{jobber.name}</h3>
                </div>
                <Tag 
                  value={jobber.status === 'active' ? 'Active' : 'Inactive'}
                  severity={jobber.status === 'active' ? 'success' : 'danger'}
                  className="align-self-start"
                />
              </div>

              <div className="flex flex-column gap-2 mb-3">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-phone text-sm" />
                  <span className="text-sm">{jobber.mobile}</span>
                </div>
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-envelope text-sm" />
                  <span className="text-sm">{jobber.email}</span>
                </div>
                <div className="flex align-items-start gap-2">
                  <i className="pi pi-map-marker text-sm mt-1" />
                  <span className="text-sm">{jobber.address}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {jobber.skills.map((skill, index) => (
                  <Tag 
                    key={index} 
                    value={skill} 
                    rounded 
                    className="text-xs"
                  />
                ))}
              </div>

              <div className="flex justify-content-end gap-1">
                <Button 
                  icon="pi pi-pencil" 
                  rounded 
                  text 
                  onClick={(e) => {
                    e.stopPropagation();
                    showEditDialog(jobber);
                  }}
                  severity="secondary"
                  tooltip="Edit jobber"
                  tooltipOptions={{ position: 'top' }}
                />
                <Button 
                  icon={jobber.status === 'active' ? 'pi pi-trash' : 'pi pi-replay'} 
                  rounded 
                  text 
                  severity={jobber.status === 'active' ? 'danger' : 'success'}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmStatusChange(jobber.id);
                  }}
                />
              </div>
            </Card>
          ))
        ) : (
          <div className="w-full p-4 text-center surface-100 border-round">
            <i className="pi pi-search text-3xl mb-2" />
            <h4>No jobbers found</h4>
          </div>
        )}
      </div>

      <Dialog 
        header={isEditMode ? "Edit Jobber" : "Add New Jobber"} 
        visible={visible} 
        maximized={isMaximized}
        onMaximize={(e) => setIsMaximized(e.maximized)}
        className="w-full"
        onHide={() => setVisible(false)}
        footer={footerContent}
      >
        {currentJobber && (
          <div className="p-fluid grid">
            <div className="field col-12 md:col-6">
              <label htmlFor="name">Name</label>
              <InputText 
                id="name" 
                value={currentJobber.name} 
                onChange={(e) => setCurrentJobber({...currentJobber, name: e.target.value})} 
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="mobile">Mobile</label>
              <InputText 
                id="mobile" 
                value={currentJobber.mobile} 
                onChange={(e) => setCurrentJobber({...currentJobber, mobile: e.target.value})} 
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="email">Email</label>
              <InputText 
                id="email" 
                value={currentJobber.email} 
                onChange={(e) => setCurrentJobber({...currentJobber, email: e.target.value})} 
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="address">Address</label>
              <InputText 
                id="address" 
                value={currentJobber.address} 
                onChange={(e) => setCurrentJobber({...currentJobber, address: e.target.value})} 
              />
            </div>
            <div className="field col-12">
              <label htmlFor="skills">Skills</label>
              <Chips
                id="skills"
                value={currentJobber.skills}
                onChange={(e) => setCurrentJobber({...currentJobber, skills: e.value || []})}
                separator=","
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
                checked={currentJobber.status === 'active'}
                onChange={(e) => setCurrentJobber({
                  ...currentJobber, 
                  status: e.value ? 'active' : 'inactive'
                })}
                className="w-full md:w-10rem"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Jobbers;