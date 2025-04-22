package com.snumart.service;

import com.snumart.model.User;
import com.snumart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    
    public boolean authenticate(String username, String password, String role) {
        Optional<User> userOpt = userRepository.findByUsernameAndRole(username, role);
        
        return userOpt.isPresent() && userOpt.get().getPassword().equals(password);
    }
}
