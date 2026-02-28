package groupproject.backend.service;

import groupproject.backend.model.Contract;
import groupproject.backend.model.User;

import java.util.List;

public interface ContractService {
    List<Contract> getMyContracts(User user);
    Contract getById(Long id, User user);
    Contract complete(Long id, String completedNote, User client);
}
