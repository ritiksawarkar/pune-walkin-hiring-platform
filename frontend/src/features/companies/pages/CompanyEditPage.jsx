import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyService } from "../../../services/companyService";
import { useToast } from "../../../context/ToastContext";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { ArrowLeftIcon } from "../../../components/common/Icons";

export function CompanyEditPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    industry: "",
    description: "",
    website: "",
    officialEmail: "",
    contactNumber: "",
    alternateContact: "",
    officeAddress: "",
    landmark: "",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411028",
    companySize: "250 - 500 Employees",
    hrContactPerson: "",
    hrContactRole: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await companyService.getCompanyProfile();
        setFormData(data);
      } catch (err) {
        showToast("Error loading company details.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Company name is mandatory.";
    if (!formData.industry.trim()) newErrors.industry = "Industry sector is mandatory.";
    if (!formData.description.trim()) newErrors.description = "Company summary is required.";
    if (!formData.officialEmail.trim()) {
      newErrors.officialEmail = "Official email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail)) {
      newErrors.officialEmail = "Please enter a valid business email address.";
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Primary contact number is required.";
    }
    if (!formData.officeAddress.trim()) {
      newErrors.officeAddress = "Office address is mandatory.";
    }
    if (!formData.hrContactPerson.trim()) {
      newErrors.hrContactPerson = "HR Contact person name is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please correct highlighted form errors.", "error");
      return;
    }

    try {
      setSaving(true);
      await companyService.updateCompanyProfile(formData);
      showToast("Company profile updated successfully!");
      navigate("/employer/company");
    } catch (err) {
      showToast("Failed to save changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeftIcon}
          onClick={() => navigate("/employer/company")}
        >
          Back to Profile
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/employer/company")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={saving}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <Card title="Company Information" padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            error={errors.name}
            placeholder="e.g. TechSprint Innovations Pvt. Ltd."
          />
          <Input
            label="Industry Sector"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
            error={errors.industry}
            placeholder="e.g. Information Technology"
          />
          <div className="sm:col-span-2">
            <Input
              label="Corporate Tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="Brief value statement or motto"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              as="textarea"
              rows={4}
              label="Company Overview"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              error={errors.description}
              placeholder="Describe your organization, engineering culture, and business domain in Pune"
            />
          </div>
          <Input
            label="Company Size"
            as="select"
            name="companySize"
            value={formData.companySize}
            onChange={handleChange}
          >
            <option value="1 - 50 Employees">1 - 50 Employees</option>
            <option value="51 - 250 Employees">51 - 250 Employees</option>
            <option value="250 - 500 Employees">250 - 500 Employees</option>
            <option value="500 - 1000 Employees">500 - 1000 Employees</option>
            <option value="1000+ Employees">1000+ Enterprise</option>
          </Input>
          <Input
            label="Official Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://yourcompany.com"
          />
        </div>
      </Card>

      <Card title="Corporate Headquarters & Pune Office" padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Office Address"
              name="officeAddress"
              value={formData.officeAddress}
              onChange={handleChange}
              required
              error={errors.officeAddress}
              placeholder="e.g. Tower B, Cybercity Magarpatta"
            />
          </div>
          <Input
            label="Landmark"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            placeholder="e.g. Near South Gate"
          />
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            placeholder="Pune"
          />
          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            placeholder="Maharashtra"
          />
          <Input
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="411028"
          />
        </div>
      </Card>

      <Card title="HR & Recruitment Contact" padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="HR Contact Person"
            name="hrContactPerson"
            value={formData.hrContactPerson}
            onChange={handleChange}
            required
            error={errors.hrContactPerson}
            placeholder="e.g. Ritik Sawarkar"
          />
          <Input
            label="Designation / Role"
            name="hrContactRole"
            value={formData.hrContactRole}
            onChange={handleChange}
            placeholder="Lead Technical Recruiter"
          />
          <Input
            label="Recruitment Email"
            name="officialEmail"
            type="email"
            value={formData.officialEmail}
            onChange={handleChange}
            required
            error={errors.officialEmail}
            placeholder="careers@company.com"
          />
          <Input
            label="Primary Contact Number"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            error={errors.contactNumber}
            placeholder="+91 98230 45678"
          />
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-8">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate("/employer/company")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={saving}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
