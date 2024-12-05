import { useState } from "react";
import { useApplicationContext } from "~/context/ApplicationContext";
import { useNotifications } from "~/context/NotificationContext";
import Button from "~/components/Button";
import Card from "~/components/Card";
import Badge from "~/components/Badge";
import Modal from "~/components/Modal";
import Input from "~/components/Input";
import Select from "~/components/Select";
import Textarea from "~/components/Textarea";
import EmptyState from "~/components/EmptyState";
import { APPLICATION_STATUS } from "~/utils/constants";
import { formatDate } from "~/utils/helpers";
import type { Application, ApplicationStatus } from "~/types";

export default function Applications() {
  const { dispatch, getFilteredAndSortedApplications } = useApplicationContext();
  const { addNotification } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus[]>([]);

  const applications = getFilteredAndSortedApplications();

  const handleAddApplication = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newApplication: Application = {
      id: crypto.randomUUID(),
      company: formData.get("company") as string,
      position: formData.get("position") as string,
      status: formData.get("status") as ApplicationStatus,
      dateApplied: formData.get("dateApplied") as string,
      location: formData.get("location") as string,
      salary: formData.get("salary") as string,
      description: formData.get("description") as string,
      notes: formData.get("notes") as string,
      url: formData.get("url") as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_APPLICATION", payload: newApplication });
    addNotification("success", "Success!", "Application added successfully");
    setIsModalOpen(false);
  };

  const handleStatusChange = (value: unknown) => {
    setSelectedStatus(value as ApplicationStatus[]);
  };

  const getBadgeVariant = (status: ApplicationStatus): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case APPLICATION_STATUS.Applied:
        return "default";
      case APPLICATION_STATUS.Interview:
        return "warning";
      case APPLICATION_STATUS.Offer:
        return "success";
      case APPLICATION_STATUS.Rejected:
        return "error";
      default:
        return "default";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track and manage your job applications
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add Application</Button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Search"
          placeholder="Search by company or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          label="Status"
          multiple
          value={selectedStatus}
          onChange={handleStatusChange}
          options={Object.values(APPLICATION_STATUS).map((status) => ({
            label: status,
            value: status,
          }))}
        />
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Start tracking your job applications by clicking the button below."
          action={
            <Button onClick={() => setIsModalOpen(true)}>Add Application</Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <Card key={application.id}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{application.company}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {application.position}
                    </p>
                  </div>
                  <Badge variant={getBadgeVariant(application.status)}>
                    {application.status}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p>Applied: {formatDate(application.dateApplied)}</p>
                  {application.location && <p>Location: {application.location}</p>}
                  {application.salary && <p>Salary: {application.salary}</p>}
                </div>
                {application.description && (
                  <p className="text-sm">{application.description}</p>
                )}
                {application.url && (
                  <a
                    href={application.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                  >
                    View Job Posting →
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Application"
      >
        <form onSubmit={handleAddApplication} className="space-y-4">
          <Input
            label="Company"
            name="company"
            required
            placeholder="Enter company name"
          />
          <Input
            label="Position"
            name="position"
            required
            placeholder="Enter job position"
          />
          <Select
            label="Status"
            name="status"
            required
            options={Object.values(APPLICATION_STATUS).map((status) => ({
              label: status,
              value: status,
            }))}
          />
          <Input
            label="Date Applied"
            name="dateApplied"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
          />
          <Input
            label="Location"
            name="location"
            placeholder="Enter job location"
          />
          <Input
            label="Salary"
            name="salary"
            placeholder="Enter salary range"
          />
          <Input
            label="Job URL"
            name="url"
            type="url"
            placeholder="Enter job posting URL"
          />
          <Textarea
            label="Description"
            name="description"
            placeholder="Enter job description"
          />
          <Textarea
            label="Notes"
            name="notes"
            placeholder="Enter any additional notes"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit">Add Application</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}