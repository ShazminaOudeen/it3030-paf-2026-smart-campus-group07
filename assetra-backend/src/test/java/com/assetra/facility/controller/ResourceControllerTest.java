package com.assetra.facility.controller;

import com.assetra.facility.controller.ResourceController;
import com.assetra.facility.dto.ResourceRequest;
import com.assetra.facility.dto.ResourceResponse;
import com.assetra.facility.enums.ResourceStatus;
import com.assetra.facility.enums.ResourceType;
import com.assetra.facility.service.ResourceService;
import com.assetra.notification.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import org.springframework.http.MediaType;

import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import java.util.UUID;

@WebMvcTest(ResourceController.class)
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ResourceService resourceService;

    @MockitoBean
    private JwtService jwtService;

    // ── Test 1: Any authenticated user can list resources ─────────────────────

    @Test
    @WithMockUser
    void getAllResources_authenticatedUser_returnsOkAndPagedList() throws Exception {
        ResourceResponse res = ResourceResponse.builder()
                .id(UUID.randomUUID())
                .name("Lab A101")
                .type(ResourceType.LAB)
                .status(ResourceStatus.ACTIVE)
                .capacity(30)
                .build();

        when(resourceService.getAllResources(
                any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(res)));

        mockMvc.perform(get("/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Lab A101"))
                .andExpect(jsonPath("$.content[0].type").value("LAB"));
    }

    // ── Test 2: Admin can create a resource ───────────────────────────────────

    @Test
    @WithMockUser(roles = "ADMIN")
    void createResource_asAdmin_returns201WithBody() throws Exception {
        ResourceRequest req = ResourceRequest.builder()
                .name("New Lab")
                .type(ResourceType.LAB)
                .capacity(40)
                .location("Block B")
                .availabilityWindow("08:00-18:00")
                .build();

        ResourceResponse resp = ResourceResponse.builder()
                .id(UUID.randomUUID())
                .name("New Lab")
                .type(ResourceType.LAB)
                .status(ResourceStatus.ACTIVE)
                .capacity(40)
                .build();

        when(resourceService.createResource(any())).thenReturn(resp);

        mockMvc.perform(post("/resources")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Lab"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    // ── Test 3: Admin can delete a resource ───────────────────────────────────

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteResource_asAdmin_returns204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/resources/{id}", id).with(csrf()))
                .andExpect(status().isNoContent());
    }

    // ── Test 4: Regular user cannot create a resource (403) ───────────────────

    @Test
    @WithMockUser
    void createResource_asRegularUser_returns403() throws Exception {
        ResourceRequest req = ResourceRequest.builder()
                .name("Unauthorized Lab")
                .type(ResourceType.LAB)
                .capacity(20)
                .build();

        mockMvc.perform(post("/resources")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }
}