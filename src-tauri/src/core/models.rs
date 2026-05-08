use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScanResult {
    /// Absolute path to the located target directory (e.g., node_modules)
    pub path: String,
    /// Total size of the directory in bytes
    pub size_bytes: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScanConfig {
    /// The root directory to start scanning from (e.g., "~/")
    pub root_path: String,
    /// Target directory names to look for (e.g., ["node_modules", "vendor"])
    pub targets: Vec<String>,
    /// Directories to ignore to speed up traversal (e.g., [".git", "Library"])
    pub exclusions: Vec<String>,
}
