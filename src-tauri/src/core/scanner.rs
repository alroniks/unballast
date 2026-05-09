use crate::core::models::{ScanConfig, ScanResult};
use jwalk::WalkDir;
use std::fs;
use std::path::Path;

/// Recursively scans for target directories (like node_modules) based on the config.
/// It uses jwalk for multi-threaded performance and short-circuits traversal
/// when it hits a target or an excluded directory.
pub fn scan_directories(config: &ScanConfig) -> Vec<ScanResult> {
    let mut results = Vec::new();
    let root = Path::new(&config.root_path);

    if !root.exists() || !root.is_dir() {
        return results;
    }

    // We use Arc/cloning for the parallel closure bounds if needed,
    // but since the walker owns the closure, we can just move cloned Vecs.
    let exclusions = config.exclusions.clone();
    let targets_for_closure = config.targets.clone();
    let targets_for_loop = config.targets.clone();

    // Configure the parallel walker
    let walker = WalkDir::new(root)
        .skip_hidden(false) // We often need to scan hidden project folders
        .process_read_dir(move |_, _, _, dir_entry_results| {
            // We use process_read_dir to decide which directories to descend into.
            // This is critical for performance: if we find a 'node_modules', we don't
            // need to scan *inside* of it for more 'node_modules'.
            for dir_entry in dir_entry_results.iter_mut().flatten() {
                if !dir_entry.file_type.is_dir() {
                    continue; // Only care about directories
                }

                if let Some(file_name) = dir_entry.file_name.to_str() {
                    // Check if it's an excluded directory
                    if exclusions.iter().any(|e| e == file_name) {
                        dir_entry.read_children_path = None; // Stop descending
                        continue;
                    }

                    // Check if it's a target directory (e.g., node_modules)
                    if targets_for_closure.iter().any(|t| t == file_name) {
                        dir_entry.read_children_path = None; // Stop descending inside the target!
                    }
                }
            }
        });

    for entry in walker.into_iter().flatten() {
        if !entry.file_type().is_dir() {
            continue;
        }

        if let Some(file_name) = entry.file_name().to_str() {
            if targets_for_loop.iter().any(|t| t == file_name) {
                let path = entry.path();
                let size_bytes = calculate_dir_size(&path);

                results.push(ScanResult {
                    path: path.to_string_lossy().to_string(),
                    size_bytes,
                });
            }
        }
    }

    results
}

/// Calculates the total size of a directory in bytes.
/// We use jwalk here too because node_modules can have tens of thousands of tiny files.
fn calculate_dir_size(path: &Path) -> u64 {
    WalkDir::new(path)
        .skip_hidden(false)
        .into_iter()
        .flatten()
        .filter(|entry| entry.file_type().is_file())
        .filter_map(|entry| entry.metadata().ok())
        .map(|m| m.len())
        .sum()
}

/// Moves a given path safely to the OS Trash.
#[allow(dead_code)]
pub fn move_to_trash(path: &str) -> Result<(), String> {
    let target = Path::new(path);
    if !target.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    trash::delete(target).map_err(|e| format!("Failed to move to trash: {}", e))
}

/// Deletes a directory permanently (rm -rf). Used only if configured by the user.
#[allow(dead_code)]
pub fn delete_permanently(path: &str) -> Result<(), String> {
    let target = Path::new(path);
    if !target.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    fs::remove_dir_all(target).map_err(|e| format!("Failed to delete permanently: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn test_scan_directories_finds_targets() {
        let dir = tempdir().unwrap();
        let root = dir.path();

        // Create mock structure
        let project_dir = root.join("my-project");
        fs::create_dir(&project_dir).unwrap();

        let node_modules = project_dir.join("node_modules");
        fs::create_dir(&node_modules).unwrap();

        // Add a mock file to give it size
        fs::write(node_modules.join("test.js"), "console.log(1);").unwrap();

        // Create an excluded directory
        let git_dir = project_dir.join(".git");
        fs::create_dir(&git_dir).unwrap();
        let git_node_modules = git_dir.join("node_modules");
        fs::create_dir(&git_node_modules).unwrap(); // This should NOT be found

        let config = ScanConfig {
            root_path: root.to_string_lossy().to_string(),
            targets: vec!["node_modules".to_string()],
            exclusions: vec![".git".to_string()],
        };

        let results = scan_directories(&config);

        assert_eq!(results.len(), 1);
        assert_eq!(results[0].path, node_modules.to_string_lossy().to_string());
        assert!(results[0].size_bytes > 0);
    }
}
