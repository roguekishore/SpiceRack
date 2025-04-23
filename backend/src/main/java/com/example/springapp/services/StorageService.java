package com.example.springapp.services;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.amazonaws.services.s3.model.ObjectMetadata;

import java.io.IOException;

@Service
@Slf4j
public class StorageService {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Autowired
    private AmazonS3 s3Client;

    public StorageService(AmazonS3 s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadGroceryFile(MultipartFile file) {
        String fileName = file.getOriginalFilename(); 
        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            s3Client.putObject(new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata));

            return s3Client.getUrl(bucketName, fileName).toString(); 
        } catch (IOException e) {
            throw new RuntimeException("Error uploading file to S3", e);
        }
    }

    public String deleteFile(String fileUrl) {
        try {
            
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            
            s3Client.deleteObject(bucketName, fileName);
    
            return fileName + " removed from S3.";
        } catch (Exception e) {
            throw new RuntimeException("Error deleting file from S3", e);
        }
    }
    

}