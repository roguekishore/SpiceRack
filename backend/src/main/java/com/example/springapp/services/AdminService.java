package com.example.springapp.services;
// package com.example.demo.services;

// import org.springframework.beans.factory.annotation.Autowired;

// import com.example.demo.entities.Admin;
// import com.example.demo.entities.Orders;
// import com.example.demo.repositories.AdminRepository;
// import com.example.demo.repositories.OrderRepository;

// import jakarta.persistence.EntityNotFoundException;

// public class AdminService {
    
//     @Autowired
//     private AdminRepository adminRepository;

//     @Autowired
//     private OrderRepository orderRepository;

//     public Admin createAdmin(Admin admin){
//         return adminRepository.save(admin);
//     }

//     public Admin getAdmin(Long adminId) {
//         return adminRepository.findById(adminId).orElseThrow(EntityNotFoundException::new);
//     }

//     public Admin modifyAdmin(Long adminId, Admin admin) {
//         Admin existingAdmin = adminRepository.findById(adminId).orElseThrow(EntityNotFoundException::new);
//         existingAdmin.setName(admin.getName());
//         existingAdmin.setEmail(admin.getEmail());
//         existingAdmin.setPassword(admin.getPassword());
//         return adminRepository.save(existingAdmin);
//     }

//     public void deleteAdmin(Long adminId){
//         adminRepository.deleteById(adminId);
//     }

//     public Orders deliverOrder(Long orderId){
//         Orders existingOrder = orderRepository.findById(orderId).orElseThrow(EntityNotFoundException::new);
//         existingOrder.setStatus(true);
//         return orderRepository.save(existingOrder);
//     }

// }
