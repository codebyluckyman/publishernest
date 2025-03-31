
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  onAvatarChange: (url: string) => void;
}

export function AvatarUpload({ userId, avatarUrl, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Check if file size is less than 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload file to Supabase storage
      const filePath = `${userId}/avatar`;
      
      // First, remove any existing avatar
      const { error: removeError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);
        
      if (removeError && !removeError.message.includes('Object not found')) {
        throw removeError;
      }
      
      // Upload new avatar
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update the avatar URL in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      onAvatarChange(publicUrlData.publicUrl);
      toast.success('Avatar updated successfully');
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;
    
    setIsUploading(true);
    try {
      const filePath = `${userId}/avatar`;
      
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);
        
      if (error && !error.message.includes('Object not found')) {
        throw error;
      }
      
      // Update the profile to remove the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      onAvatarChange('');
      toast.success('Avatar removed successfully');
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="h-20 w-20 border-2 border-muted">
        <AvatarImage src={avatarUrl || ''} alt="User avatar" />
        <AvatarFallback className="bg-primary/10">
          <User className="h-10 w-10 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex gap-2">
        <div
          {...getRootProps()}
          className={`cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          <Button 
            variant="outline" 
            size="sm" 
            type="button"
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
        
        {avatarUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            type="button"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
