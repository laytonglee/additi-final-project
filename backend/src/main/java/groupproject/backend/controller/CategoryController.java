package groupproject.backend.controller;

import groupproject.backend.model.Category;
import groupproject.backend.repository.CategoryRepository;
import groupproject.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    // Public endpoint — available for dropdowns
    @GetMapping("/api/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(
                categoryRepository.findAll(), "Categories retrieved"));
    }

    // Admin CRUD endpoints
    @PostMapping("/api/admin/categories")
    public ResponseEntity<ApiResponse<Category>> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
        if (categoryRepository.existsByName(name.trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }
        Category category = new Category();
        category.setName(name.trim());
        return ResponseEntity.ok(ApiResponse.success(
                categoryRepository.save(category), "Category created"));
    }

    @PutMapping("/api/admin/categories/{id}")
    public ResponseEntity<ApiResponse<Category>> update(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
        if (categoryRepository.existsByName(name.trim()) && !category.getName().equals(name.trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category name already taken");
        }
        category.setName(name.trim());
        return ResponseEntity.ok(ApiResponse.success(
                categoryRepository.save(category), "Category updated"));
    }

    @DeleteMapping("/api/admin/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted"));
    }
}
