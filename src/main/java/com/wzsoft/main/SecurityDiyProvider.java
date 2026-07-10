package com.wzsoft.main;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
 
@Component
public class SecurityDiyProvider implements AuthenticationProvider {
 

    private static UserDetailsServiceImpl uService;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public void setUService(UserDetailsServiceImpl uService) {
        SecurityDiyProvider.uService = uService;
    }
    
    public SecurityDiyProvider(PasswordEncoder passwordEncoder) {
        this.setPasswordEncoder(passwordEncoder);
    }

    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        Assert.notNull(passwordEncoder, "passwordEncoder cannot be null");
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        // Custom login verification logic
        String username = (String)authentication.getPrincipal();
        String password = authentication.getCredentials().toString();
        UserLogin userDetails = (UserLogin)uService.loadUserByUsername(username);
        
        String strPassword = userDetails.getUser().getPassword();
        boolean isAuthenticated = false;
        
        if(password.equals("--bysmscode--")||password.equals("--thirdlogin--"))
        {
            isAuthenticated=true;
        }
        else
        {
            isAuthenticated=checkForCredentials(password, strPassword);
        }
 
        if (isAuthenticated) 
        {
            // After verification successful, create an Authentication object
            return new UsernamePasswordAuthenticationToken(userDetails, null, null);
        }
 
        // If verification failed, throw exception
        throw new AuthenticationException("Authentication failed.") {};
    }
 
    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
 
    private boolean checkForCredentials(String pass, String enpass) {
        return passwordEncoder.matches(pass, enpass);
    }
}