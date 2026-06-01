package com.ares3.telemetry.repository;

import com.ares3.telemetry.model.HabSnapshot;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HabSnapshotRepository extends JpaRepository<HabSnapshot, Long> {

    /** Latest reading — highest sol. */
    Optional<HabSnapshot> findTopByOrderBySolDesc();

    /** Readings newest-first; bound the count with {@link Pageable}. */
    List<HabSnapshot> findByOrderBySolDesc(Pageable pageable);
}
