'use client';

import FileService from '@/services/file.service';
import { App, Button, Flex, Modal, Slider, Spin, Typography, Upload, theme } from 'antd';
import { Camera, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import Cropper from 'react-easy-crop';

const BUCKET = 'images';

const cropToFile = (imageSrc, area) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = area.width;
      canvas.height = area.height;
      canvas
        .getContext('2d')
        .drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' })) : reject(new Error('Crop failed'))),
        'image/jpeg',
        0.9,
      );
    };
    image.onerror = reject;
    image.src = imageSrc;
  });

// Control ảnh đại diện cho antd Form: value = { url, path }
export default function AvatarUpload({ value, onChange }) {
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);

  const url = value?.url;

  const closeCrop = () => {
    URL.revokeObjectURL(cropSrc);
    setCropSrc('');
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const confirmCrop = async () => {
    if (!croppedArea) return;
    try {
      setUploading(true);
      const file = await cropToFile(cropSrc, croppedArea);
      closeCrop();
      const result = await FileService.upload(BUCKET, file);
      const publicUrl = await FileService.publicUrl(BUCKET, result.path);
      onChange?.({ url: publicUrl, path: result.path });
      message.success('Tải ảnh lên thành công');
    } catch (error) {
      console.error('Upload avatar error:', error);
      message.error('Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);
      if (value?.path) await FileService.delete(BUCKET, value.path);
      onChange?.({ url: '', path: '' });
      message.success('Xóa ảnh thành công');
    } catch (error) {
      console.error('Delete avatar error:', error);
      message.error('Lỗi khi xóa ảnh');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Flex vertical align="center" gap={8}>
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={(file) => {
          setCropSrc(URL.createObjectURL(file));
          return false;
        }}
      >
        <Spin spinning={uploading}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 12,
              overflow: 'hidden',
              cursor: 'pointer',
              border: `2px dashed ${token.colorBorder}`,
              background: token.colorFillTertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Flex vertical align="center" gap={4} style={{ color: token.colorTextTertiary }}>
                <User size={32} />
                <span style={{ fontSize: 12 }}>Ảnh đại diện</span>
              </Flex>
            )}
          </div>
        </Spin>
      </Upload>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        <Camera size={12} /> Bấm để {url ? 'đổi ảnh' : 'tải ảnh lên'} · PNG, JPG tối đa 5MB
      </Typography.Text>
      {url && (
        <Button danger type="text" size="small" icon={<Trash2 size={14} />} onClick={removeAvatar} disabled={uploading}>
          Xóa ảnh
        </Button>
      )}

      <Modal
        title="Cắt ảnh đại diện"
        open={!!cropSrc}
        width={700}
        okText="Xác nhận"
        cancelText="Hủy"
        onOk={confirmCrop}
        onCancel={closeCrop}
        destroyOnHidden
      >
        <div style={{ position: 'relative', height: 400, background: '#333' }}>
          {cropSrc && (
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setCroppedArea(areaPixels)}
            />
          )}
        </div>
        <Slider min={1} max={3} step={0.05} value={zoom} onChange={setZoom} />
      </Modal>
    </Flex>
  );
}
