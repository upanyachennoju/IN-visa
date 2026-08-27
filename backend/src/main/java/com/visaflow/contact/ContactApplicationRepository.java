package com.visaflow.contact;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.visaflow.application.Application;

public interface ContactApplicationRepository extends JpaRepository<Application, Long> {
	Optional<Application> findByTempId(String tempId);
}
