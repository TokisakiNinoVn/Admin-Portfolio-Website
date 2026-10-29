'use client';

import AvatarUpload from '@/components/AvatarUpload';
import RichTextEditor from '@/components/RichTextEditor';
import { SortableItem, SortableList } from '@/components/Sortable';
import SkillCategoriesService from '@/services/categories-skills.service';
import SkillsService from '@/services/skills.service';
import { dateStringItemProps, generateSlug } from '@/utils/format.util';
import { FooterToolbar, ProCard, ProForm } from '@ant-design/pro-components';
import {
  App,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import { ChevronDown, ChevronUp, FolderOpen, Layers, List, Maximize2, Minimize2, Plus, Share2, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export const TEMPLATE_OPTIONS = [
  { label: 'Template 1', value: 'template-1' },
  { label: 'Template 2', value: 'template-2' },
  { label: 'Template 3', value: 'template-3' },
];

const TYPE_GROUP_OPTIONS = [
  { label: 'Công việc', value: 'WORK' },
  { label: 'Học vấn', value: 'EDUCATION' },
  { label: 'Chứng chỉ', value: 'CERTIFICATE' },
  { label: 'Hoạt động', value: 'EVENT' },
  { label: 'Kỹ năng', value: 'SKILL' },
];

const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác'].map((v) => ({ label: v, value: v }));

export const emptyEvent = () => ({
  label: '',
  position: '',
  content: '',
  location: '',
  start_date: '',
  end_date: '',
  skills: [],
  demo_url: '',
  github_url: '',
});

export const emptyGroup = () => ({
  label: '',
  description: '',
  type_group: 'WORK',
  events: [emptyEvent()],
});

const omitUiKeys = ({ id, expanded, ...rest }) => rest;

// Chuyển dữ liệu form thành payload lưu vào bảng curriculum_vitae
const toPayload = (values) => ({
  slug: values.slug,
  template: values.template,
  full_name: values.full_name,
  avatar: values.avatar?.url || '',
  title: values.title,
  phone: values.phone,
  email: values.email ?? '',
  address: values.address ?? '',
  gender: values.gender ?? '',
  birthday: values.birthday ?? '',
  social_links: values.social_links ?? [],
  groups_event: (values.groups_event ?? []).map((group) => ({
    ...omitUiKeys(group),
    events: group.type_group === 'EVENT' ? (group.events ?? []).map(omitUiKeys) : [],
  })),
});

export default function CvForm({ initialValues, otherSlugs = [], submitText = 'Lưu', onSubmit }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const prevTitle = useRef(initialValues?.title ?? '');

  useEffect(() => {
    SkillsService.list()
      .then((data) => setSkills(data || []))
      .catch((error) => {
        console.error('Error fetching skills:', error);
        message.error('Lỗi khi tải danh sách kỹ năng');
      });
    SkillCategoriesService.list()
      .then((data) => setCategories(data || []))
      .catch((error) => {
        console.error('Error fetching skill category:', error);
        message.error('Lỗi khi tải danh sách danh mục kỹ năng');
      });
  }, [message]);

  const groups = Form.useWatch('groups_event', form) ?? [];

  const toggle = (key) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const handleValuesChange = (changed) => {
    if ('title' in changed) {
      const slug = form.getFieldValue('slug');
      if (!slug || slug === generateSlug(prevTitle.current)) {
        form.setFieldValue('slug', generateSlug(changed.title || ''));
      }
      prevTitle.current = changed.title || '';
    }
  };

  const handleFinish = async () => {
    try {
      await onSubmit(toPayload(form.getFieldsValue(true)));
    } catch (error) {
      console.error('Error saving CV:', error);
      message.error('Có lỗi xảy ra khi lưu CV!');
    }
  };

  const slugRules = [
    { required: true, message: 'Slug là bắt buộc' },
    { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ được chứa chữ thường, số và dấu "-"' },
    {
      validator: (_, value) =>
        value && otherSlugs.includes(value)
          ? Promise.reject(new Error('Slug này đã tồn tại, vui lòng chọn slug khác'))
          : Promise.resolve(),
    },
  ];

  return (
    <ProForm
      form={form}
      layout="vertical"
      initialValues={{ ...initialValues, slug: initialValues?.slug || generateSlug(initialValues?.title || '') }}
      onValuesChange={handleValuesChange}
      onFinish={handleFinish}
      onFinishFailed={() => setCollapsed(new Set())}
      scrollToFirstError
      submitter={{
        searchConfig: { submitText, resetText: 'Đặt lại' },
        render: (_, dom) => <FooterToolbar>{dom}</FooterToolbar>,
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Cột trái: thông tin cơ bản */}
        <Col xs={24} lg={9}>
          <ProCard title="Thông tin cơ bản" bordered>
            <Form.Item name="avatar">
              <AvatarUpload />
            </Form.Item>
            <Form.Item name="template" label="Template" rules={[{ required: true, message: 'Vui lòng chọn template' }]}>
              <Select options={TEMPLATE_OPTIONS} />
            </Form.Item>
            <Divider />
            <Form.Item name="title" label="Tiêu đề CV" rules={[{ required: true, message: 'Tiêu đề CV là bắt buộc' }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="slug"
              label="Slug"
              rules={slugRules}
              normalize={(v) => (v || '').toLowerCase().replace(/\s+/g, '-')}
            >
              <Input
                placeholder="ten-cv-cua-ban"
                onBlur={(e) => e.target.value && form.setFieldValue('slug', generateSlug(e.target.value))}
              />
            </Form.Item>
            <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Họ và tên là bắt buộc' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Số điện thoại là bắt buộc' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ">
              <Input />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="gender" label="Giới tính">
                  <Select options={GENDER_OPTIONS} allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="birthday" label="Ngày sinh" {...dateStringItemProps}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
            <SocialLinks />
          </ProCard>
        </Col>

        {/* Cột phải: các nhóm & sự kiện */}
        <Col xs={24} lg={15}>
          <Form.List name="groups_event">
            {(fields, { add, remove, move }) => {
              const allExpanded = fields.length > 0 && fields.every((f) => !collapsed.has(`g-${f.key}`));
              return (
                <ProCard
                  bordered
                  title={
                    <Space>
                      <Layers size={18} />
                      Các nhóm (Kinh nghiệm, Học vấn, ...)
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button
                        size="small"
                        icon={allExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        onClick={() =>
                          setCollapsed(allExpanded ? new Set(fields.map((f) => `g-${f.key}`)) : new Set())
                        }
                      >
                        {allExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                      </Button>
                      <Button size="small" type="primary" icon={<Plus size={14} />} onClick={() => add(emptyGroup())}>
                        Thêm nhóm
                      </Button>
                    </Space>
                  }
                >
                  {fields.length === 0 ? (
                    <Empty image={<FolderOpen size={40} />} description='Chưa có nhóm nào, bấm "Thêm nhóm" để bắt đầu' />
                  ) : (
                    <SortableList ids={fields.map((f) => `g-${f.key}`)} onMove={move}>
                      <Flex vertical gap={12}>
                        {fields.map((field) => (
                          <SortableItem key={field.key} id={`g-${field.key}`}>
                            {(handle) => (
                              <GroupCard
                                field={field}
                                group={groups[field.name]}
                                handle={handle}
                                collapsed={collapsed}
                                toggle={toggle}
                                skills={skills}
                                categories={categories}
                                onRemove={() => remove(field.name)}
                              />
                            )}
                          </SortableItem>
                        ))}
                      </Flex>
                    </SortableList>
                  )}
                </ProCard>
              );
            }}
          </Form.List>
        </Col>
      </Row>
    </ProForm>
  );
}

function SocialLinks() {
  return (
    <Form.List name="social_links">
      {(fields, { add, remove }) => (
        <>
          <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
            <Typography.Text strong>
              <Share2 size={14} /> Liên kết mạng xã hội
            </Typography.Text>
            <Button type="link" size="small" icon={<Plus size={14} />} onClick={() => add({ name: '', link: '' })}>
              Thêm
            </Button>
          </Flex>
          {fields.map((field) => (
            <Flex key={field.key} gap={8} align="start">
              <Form.Item name={[field.name, 'name']} style={{ width: '32%' }}>
                <Input placeholder="VD: Facebook" />
              </Form.Item>
              <Form.Item name={[field.name, 'link']} style={{ flex: 1 }}>
                <Input placeholder="https://..." />
              </Form.Item>
              <Button danger type="text" icon={<Trash2 size={16} />} onClick={() => remove(field.name)} />
            </Flex>
          ))}
        </>
      )}
    </Form.List>
  );
}

function GroupCard({ field, group, handle, collapsed, toggle, skills, categories, onRemove }) {
  const key = `g-${field.key}`;
  const isCollapsed = collapsed.has(key);
  const type = group?.type_group;
  const typeLabel = TYPE_GROUP_OPTIONS.find((t) => t.value === type)?.label ?? type;

  return (
    <ProCard
      size="small"
      bordered
      headerBordered={!isCollapsed}
      title={
        <Flex align="center" gap={8} style={{ width: '100%' }}>
          {handle}
          <Button
            type="text"
            size="small"
            icon={isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            onClick={() => toggle(key)}
          />
          <Form.Item
            name={[field.name, 'label']}
            rules={[{ required: true, message: 'Tên nhóm là bắt buộc' }]}
            normalize={(v) => v?.toUpperCase()}
            style={{ margin: 0, flex: 1, minWidth: 160 }}
          >
            <Input variant="borderless" placeholder="Tên nhóm (VD: KINH NGHIỆM LÀM VIỆC)" style={{ fontWeight: 600 }} />
          </Form.Item>
        </Flex>
      }
      extra={
        <Space size={4}>
          <Tag color="default">{typeLabel}</Tag>
          {type === 'EVENT' && (
            <Tag icon={<List size={12} style={{ marginRight: 4 }} />}>{group?.events?.length ?? 0}</Tag>
          )}
          <Button danger type="text" size="small" icon={<Trash2 size={16} />} onClick={onRemove} />
        </Space>
      }
    >
      {/* Giữ các field luôn mount để validate được khi thu gọn */}
      <div style={{ display: isCollapsed ? 'none' : undefined }}>
        <Form.Item name={[field.name, 'type_group']} label="Loại nhóm" style={{ maxWidth: 240 }}>
          <Select options={TYPE_GROUP_OPTIONS} />
        </Form.Item>

        {type === 'SKILL' && (
          <Form.Item name={[field.name, 'skills_by_category']} label="Danh mục kỹ năng">
            <SkillsByCategoryInput categories={categories} skills={skills} />
          </Form.Item>
        )}

        {type && type !== 'SKILL' && type !== 'EVENT' && (
          <Form.Item name={[field.name, 'description']} label="Mô tả nhóm">
            <RichTextEditor />
          </Form.Item>
        )}

        {type === 'EVENT' && (
          <EventList groupField={field} events={group?.events ?? []} collapsed={collapsed} toggle={toggle} skills={skills} />
        )}
      </div>
    </ProCard>
  );
}

function EventList({ groupField, events, collapsed, toggle, skills }) {
  return (
    <Form.List name={[groupField.name, 'events']}>
      {(fields, { add, remove, move }) => (
        <>
          <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
            <Typography.Text type="secondary" strong>
              Sự kiện
            </Typography.Text>
            <Button type="link" size="small" icon={<Plus size={14} />} onClick={() => add(emptyEvent())}>
              Thêm sự kiện
            </Button>
          </Flex>
          {fields.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có sự kiện nào trong nhóm này" />
          ) : (
            <SortableList ids={fields.map((f) => `e-${f.key}`)} onMove={move}>
              <Flex vertical gap={8}>
                {fields.map((field) => (
                  <SortableItem key={field.key} id={`e-${field.key}`}>
                    {(handle) => (
                      <EventCard
                        field={field}
                        event={events[field.name]}
                        handle={handle}
                        collapseKey={`e-${groupField.key}-${field.key}`}
                        collapsed={collapsed}
                        toggle={toggle}
                        skills={skills}
                        onRemove={() => remove(field.name)}
                      />
                    )}
                  </SortableItem>
                ))}
              </Flex>
            </SortableList>
          )}
        </>
      )}
    </Form.List>
  );
}

function EventCard({ field, event, handle, collapseKey, collapsed, toggle, skills, onRemove }) {
  const isCollapsed = collapsed.has(collapseKey);
  const skillOptions = useMemo(() => skills.map((s) => ({ label: s.name, value: s.id })), [skills]);

  return (
    <ProCard
      size="small"
      bordered
      style={{ background: 'transparent' }}
      title={
        <Flex align="center" gap={8} style={{ width: '100%' }}>
          {handle}
          <Button
            type="text"
            size="small"
            icon={isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            onClick={() => toggle(collapseKey)}
          />
          <Form.Item
            name={[field.name, 'label']}
            rules={[{ required: true, message: 'Tên sự kiện là bắt buộc' }]}
            style={{ margin: 0, flex: 1, display: isCollapsed ? 'none' : undefined }}
          >
            <Input variant="borderless" placeholder="Tên sự kiện" />
          </Form.Item>
          {isCollapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text strong ellipsis>
                {event?.label || 'Sự kiện chưa đặt tên'}
              </Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                {[
                  event?.position,
                  event?.start_date || event?.end_date
                    ? `${event?.start_date || '?'} → ${event?.end_date || 'Hiện tại'}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography.Text>
            </div>
          )}
        </Flex>
      }
      extra={<Button danger type="text" size="small" icon={<Trash2 size={16} />} onClick={onRemove} />}
    >
      <div style={{ display: isCollapsed ? 'none' : undefined }}>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item name={[field.name, 'position']} label="Vị trí / Chức vụ">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name={[field.name, 'location']} label="Địa điểm">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name={[field.name, 'start_date']} label="Ngày bắt đầu" {...dateStringItemProps}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name={[field.name, 'end_date']} label="Ngày kết thúc" {...dateStringItemProps}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={[field.name, 'content']} label="Nội dung mô tả">
          <RichTextEditor />
        </Form.Item>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item name={[field.name, 'demo_url']} label="URL Demo">
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name={[field.name, 'github_url']} label="URL Github">
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={[field.name, 'skills']} label="Kỹ năng liên quan">
          <Select mode="multiple" allowClear options={skillOptions} optionFilterProp="label" />
        </Form.Item>
      </div>
    </ProCard>
  );
}

// value: { [categoryId]: Skill[] } — giữ nguyên object kỹ năng như dữ liệu cũ
function SkillsByCategoryInput({ value = {}, onChange, categories, skills }) {
  const setCategory = (categoryId, selected) => {
    const next = { ...value };
    if (selected === undefined) delete next[categoryId];
    else next[categoryId] = selected;
    onChange?.(next);
  };

  return (
    <Flex vertical gap={8} style={{ width: '100%' }}>
      {categories.map((category) => {
        const checked = category.id in value || String(category.id) in value;
        const selected = value[category.id] ?? [];
        const options = skills
          .filter((s) => s.categories_skill_id === category.id)
          .map((s) => ({ label: s.label, value: s.id }));

        return (
          <div key={category.id}>
            <Checkbox checked={checked} onChange={(e) => setCategory(category.id, e.target.checked ? [] : undefined)}>
              {category.label}
            </Checkbox>
            {checked && (
              <Select
                mode="multiple"
                allowClear
                placeholder="Chọn kỹ năng"
                style={{ width: '100%', marginTop: 4, paddingLeft: 24 }}
                options={options}
                optionFilterProp="label"
                value={selected.map((s) => s.id)}
                onChange={(ids) =>
                  setCategory(
                    category.id,
                    ids.map((id) => skills.find((s) => s.id === id) ?? selected.find((s) => s.id === id)),
                  )
                }
              />
            )}
          </div>
        );
      })}
    </Flex>
  );
}
